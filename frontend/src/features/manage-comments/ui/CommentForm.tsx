import {
  MAX_COMMENT_TEXT_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_HOME_PAGE_LENGTH,
  MAX_USER_NAME_LENGTH,
  validateCommentHtml,
} from '@comments-spa/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { type Control, Controller, useForm } from 'react-hook-form';
import { sanitizeCommentHtml } from '@/entities/comment/lib/sanitizeCommentHtml';
import type { Comment } from '@/entities/comment/model/types';
import { useCaptchaQuery } from '@/features/manage-comments/api/useCaptchaQuery';
import { useCreateCommentMutation } from '@/features/manage-comments/api/useCreateCommentMutation';
import {
  type CommentHtmlTag,
  insertHtmlTag,
} from '@/features/manage-comments/lib/insertHtmlTag';
import { parseFieldValidationError } from '@/features/manage-comments/lib/parseFieldValidationError';
import {
  type CommentFormValues,
  commentFormSchema,
} from '@/features/manage-comments/model/validation';
import { CommentHtmlToolbar } from '@/features/manage-comments/ui/CommentHtmlToolbar';
import { interactivePanelTrigger } from '@/shared/lib/interactiveStyles';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

const getDefaultValues = (parentId: number | null): CommentFormValues => ({
  userName: '',
  email: '',
  homePage: '',
  captchaId: '',
  captchaValue: '',
  text: '',
  parentId: parentId ?? undefined,
  file: undefined,
});

const isSvgString = (value: string): boolean => {
  const trimmed = value.trim();

  return trimmed.startsWith('<svg') || trimmed.startsWith('<?xml');
};

const toImageSrc = (value: string): string => {
  const trimmed = value.trim();

  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  if (isSvgString(trimmed)) {
    const sanitized = DOMPurify.sanitize(trimmed, {
      USE_PROFILES: { svg: true },
    });

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sanitized)}`;
  }

  return `data:image/png;base64,${trimmed}`;
};

type CaptchaImageProps = {
  image: string;
  compact?: boolean;
};

const CaptchaImage = ({ image, compact = false }: CaptchaImageProps) => (
  <img
    src={toImageSrc(image)}
    alt=""
    aria-hidden
    className={cn(
      'shrink-0 rounded-md border border-border bg-background object-contain',
      compact ? 'h-10 w-28' : 'h-12 w-32',
    )}
  />
);

export type CommentFormProps = {
  parentId?: number | null;
  onSuccess?: (comment: Comment) => void;
};

const FieldError = ({ message }: { message?: string }) => (
  <p
    className={cn('min-h-4 text-xs text-red-600', !message && 'invisible')}
    aria-live="polite"
  >
    {message ?? '\u00A0'}
  </p>
);

const FieldLabel = ({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string;
  children: string;
  required?: boolean;
}) => (
  <label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
    {children}
    {required ? <span className="text-red-500"> *</span> : null}
  </label>
);

const boxVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const commentTextClassName =
  'whitespace-pre-line text-sm leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_p+p]:mt-2';

const CommentTextPreview = ({ text }: { text: string }) => {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return (
      <p className="px-3 py-2 text-sm italic text-muted-foreground">
        Nothing to preview.
      </p>
    );
  }

  const htmlError = validateCommentHtml(trimmed);

  if (htmlError !== null) {
    return (
      <p className="px-3 py-2 text-sm text-red-600" aria-live="polite">
        {htmlError}
      </p>
    );
  }

  return (
    <div
      className={cn('px-3 py-2', commentTextClassName)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized with DOMPurify before rendering
      dangerouslySetInnerHTML={{ __html: sanitizeCommentHtml(text) }}
    />
  );
};

type CommentTextFieldProps = {
  control: Control<CommentFormValues>;
  disabled: boolean;
  isReply: boolean;
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
};

const CommentTextField = ({
  control,
  disabled,
  isReply,
  textAreaRef,
}: CommentTextFieldProps) => (
  <Controller
    name="text"
    control={control}
    render={({ field }) => {
      const handleRef = (element: HTMLTextAreaElement | null): void => {
        field.ref(element);
        textAreaRef.current = element;
      };

      return (
        <Textarea
          id="text"
          placeholder="Write your comment..."
          disabled={disabled}
          maxLength={MAX_COMMENT_TEXT_LENGTH}
          value={field.value}
          onBlur={field.onBlur}
          onChange={field.onChange}
          ref={handleRef}
          className={cn(
            'rounded-t-none text-sm',
            isReply ? 'min-h-[64px]' : 'min-h-[72px]',
          )}
        />
      );
    }}
  />
);

export const CommentForm = ({
  parentId = null,
  onSuccess,
}: CommentFormProps) => {
  const isReply = parentId !== null;
  const [isFolded, setIsFolded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const {
    mutate,
    isPending,
    isError,
    error,
    reset: resetMutation,
  } = useCreateCommentMutation();
  const {
    data: captcha,
    isLoading: isCaptchaLoading,
    isError: isCaptchaError,
    error: captchaError,
    refetch: refetchCaptcha,
    isFetching: isCaptchaFetching,
  } = useCaptchaQuery();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: getDefaultValues(parentId),
  });

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setValue('parentId', parentId ?? undefined);
  }, [parentId, setValue]);

  useEffect(() => {
    if (captcha?.id) {
      setValue('captchaId', captcha.id);
    }
  }, [captcha?.id, setValue]);

  const refreshCaptchaChallenge = async (): Promise<void> => {
    const { data } = await refetchCaptcha();

    if (data?.id) {
      setValue('captchaId', data.id);
    }
  };

  const handleRefreshCaptcha = async (): Promise<void> => {
    setValue('captchaValue', '');
    await refreshCaptchaChallenge();
  };

  const handleSubmissionError = (submissionError: unknown): void => {
    const fieldError = parseFieldValidationError(submissionError);

    if (fieldError) {
      setError(fieldError.formField, {
        type: 'server',
        message: fieldError.message,
      });
      resetMutation();

      if (fieldError.formField === 'captchaValue') {
        setValue('captchaValue', '');
        void refreshCaptchaChallenge();
      }

      return;
    }
  };

  const onSubmit = (values: CommentFormValues): void => {
    const formData = new FormData();

    formData.append('userName', values.userName);
    formData.append('email', values.email);
    formData.append('captchaId', values.captchaId);
    formData.append('captchaAnswer', values.captchaValue);
    formData.append('text', values.text);

    if (values.homePage && values.homePage.length > 0) {
      formData.append('homePage', values.homePage);
    }

    if (values.parentId !== undefined) {
      formData.append('parentId', String(values.parentId));
    }

    if (values.file) {
      formData.append('file', values.file);
    }

    mutate(formData, {
      onSuccess: async (createdComment) => {
        reset(getDefaultValues(parentId));
        setIsPreviewOpen(false);
        setValue('captchaValue', '');
        await refreshCaptchaChallenge();
        onSuccess?.(createdComment);
      },
      onError: handleSubmissionError,
    });
  };

  const handleInsertHtmlTag = (tag: CommentHtmlTag): void => {
    const textarea = textAreaRef.current;

    if (textarea === null) {
      return;
    }

    const currentValue = getValues('text');
    const { value, selectionStart, selectionEnd } = insertHtmlTag(
      currentValue,
      textarea.selectionStart,
      textarea.selectionEnd,
      tag,
    );

    setValue('text', value, { shouldDirty: true, shouldValidate: true });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const commentText = watch('text');

  const isCaptchaBusy = isCaptchaLoading || isCaptchaFetching;
  const captchaErrorMessage =
    captchaError instanceof Error
      ? captchaError.message
      : 'Failed to load captcha. Please try again.';
  const showGlobalError = isError && parseFieldValidationError(error) === null;

  const isExpanded = isReply || !isFolded;

  return (
    <motion.form
      variants={boxVariants}
      initial="initial"
      animate="animate"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-2.5 rounded-lg border border-border p-3"
      noValidate
    >
      {!isReply ? (
        <button
          type="button"
          className={interactivePanelTrigger}
          aria-expanded={isExpanded}
          aria-label={
            isFolded ? 'Expand comment form' : 'Collapse comment form'
          }
          onClick={() => {
            setIsFolded((folded) => !folded);
          }}
        >
          <span className="text-xs font-medium text-muted-foreground">
            Post a comment
          </span>
          {isFolded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      ) : (
        <p className="text-xs font-medium text-muted-foreground">
          Write a reply
        </p>
      )}

      {isExpanded ? (
        <div className="contents">
          {!!showGlobalError && (
            <p className="rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
              {error instanceof Error
                ? error.message
                : 'Failed to submit comment. Please try again.'}
            </p>
          )}

          <div
            className={cn(
              'grid gap-2.5',
              isReply ? 'grid-cols-1' : 'sm:grid-cols-2',
            )}
          >
            <div className="space-y-1">
              <FieldLabel htmlFor="userName" required>
                Username
              </FieldLabel>
              <Input
                id="userName"
                autoComplete="username"
                disabled={isPending}
                maxLength={MAX_USER_NAME_LENGTH}
                className="h-8 text-sm"
                {...register('userName')}
              />
              <FieldError message={errors.userName?.message} />
            </div>

            <div className="space-y-1">
              <FieldLabel htmlFor="email" required>
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isPending}
                maxLength={MAX_EMAIL_LENGTH}
                className="h-8 text-sm"
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </div>
          </div>

          <div className="space-y-1">
            <FieldLabel htmlFor="homePage">Homepage</FieldLabel>
            <Input
              id="homePage"
              type="url"
              placeholder="https://example.com"
              disabled={isPending}
              maxLength={MAX_HOME_PAGE_LENGTH}
              className="h-8 text-sm"
              {...register('homePage', {
                onBlur: () => {
                  void trigger('homePage');
                },
              })}
            />
            <FieldError message={errors.homePage?.message} />
          </div>

          <div className="space-y-1">
            <FieldLabel htmlFor="text" required>
              Comment
            </FieldLabel>
            <CommentHtmlToolbar
              compact
              disabled={isPending || isPreviewOpen}
              onInsertTag={handleInsertHtmlTag}
            />
            {isPreviewOpen ? (
              <section
                id="text"
                aria-label="Comment preview"
                className={cn(
                  'rounded-t-none border border-border bg-background text-sm',
                  isReply ? 'min-h-[64px]' : 'min-h-[72px]',
                )}
              >
                <CommentTextPreview text={commentText} />
              </section>
            ) : (
              <CommentTextField
                control={control}
                disabled={isPending}
                isReply={isReply}
                textAreaRef={textAreaRef}
              />
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] leading-tight text-muted-foreground">
                Allowed tags: &lt;a&gt;, &lt;code&gt;, &lt;i&gt;, &lt;strong&gt;
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                disabled={isPending}
                onClick={() => {
                  setIsPreviewOpen((open) => !open);
                }}
              >
                {isPreviewOpen ? 'Edit' : 'Preview'}
              </Button>
            </div>
            <FieldError message={errors.text?.message} />
          </div>

          <div className="space-y-1">
            <FieldLabel htmlFor="file">Attachment</FieldLabel>
            <Controller
              name="file"
              control={control}
              render={({ field: { onChange, ref, name, onBlur } }) => (
                <Input
                  id="file"
                  name={name}
                  ref={ref}
                  type="file"
                  accept=".jpg,.jpeg,.gif,.png,.txt"
                  disabled={isPending}
                  className="h-8 text-xs"
                  onBlur={onBlur}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    onChange(file ?? undefined);
                  }}
                />
              )}
            />
            <p className="text-[11px] leading-tight text-muted-foreground">
              JPG, JPEG, GIF, PNG, or TXT (max 100 KB for TXT)
            </p>
            <FieldError message={errors.file?.message} />
          </div>

          <input type="hidden" {...register('captchaId')} />

          <div className="space-y-1">
            <FieldLabel htmlFor="captchaValue" required>
              Captcha
            </FieldLabel>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex shrink-0 items-center gap-1">
                {isCaptchaError ? (
                  <div
                    aria-hidden
                    className="flex h-10 w-28 items-center justify-center rounded-md border border-dashed border-red-200 bg-red-50 text-[10px] text-red-500"
                  >
                    Load failed
                  </div>
                ) : isCaptchaBusy || !captcha?.image ? (
                  <div
                    aria-hidden
                    className="h-10 w-28 animate-pulse rounded-md border border-dashed border-border bg-muted"
                  />
                ) : (
                  <CaptchaImage image={captcha.image} compact />
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  aria-label="Refresh captcha"
                  disabled={isPending || isCaptchaBusy}
                  onClick={() => {
                    void handleRefreshCaptcha();
                  }}
                >
                  <RefreshCw
                    className={cn(
                      'h-3.5 w-3.5',
                      isCaptchaBusy && 'animate-spin',
                    )}
                  />
                </Button>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <Input
                  id="captchaValue"
                  placeholder="Enter captcha"
                  autoComplete="off"
                  disabled={isPending || isCaptchaLoading || isCaptchaError}
                  className="h-8 text-sm"
                  {...register('captchaValue')}
                />
                <FieldError
                  message={
                    errors.captchaValue?.message ??
                    (isCaptchaError ? captchaErrorMessage : undefined)
                  }
                />
              </div>
            </div>
          </div>

          <div className="-mx-3 -mb-3 flex justify-end rounded-b-lg border-t border-border bg-muted/30 px-3 py-2">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isPending || isCaptchaLoading || isCaptchaError}
            >
              {isPending
                ? 'Submitting...'
                : isReply
                  ? 'Post reply'
                  : 'Post comment'}
            </Button>
          </div>
        </div>
      ) : null}
    </motion.form>
  );
};
