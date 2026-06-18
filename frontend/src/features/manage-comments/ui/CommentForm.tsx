import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useCaptchaQuery } from '@/features/manage-comments/api/useCaptchaQuery';
import { useCreateCommentMutation } from '@/features/manage-comments/api/useCreateCommentMutation';
import {
  type CommentFormValues,
  commentFormSchema,
} from '@/features/manage-comments/model/validation';
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
      'shrink-0 rounded-md border border-slate-200 bg-white object-contain',
      compact ? 'h-10 w-28' : 'h-12 w-32',
    )}
  />
);

export type CommentFormProps = {
  parentId?: number | null;
  onSuccess?: () => void;
};

const FieldError = ({ message }: { message?: string }) => {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-red-600">{message}</p>;
};

const FieldLabel = ({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string;
  children: string;
  required?: boolean;
}) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
    {children}
    {required ? <span className="text-red-500"> *</span> : null}
  </label>
);

export const CommentForm = ({
  parentId = null,
  onSuccess,
}: CommentFormProps) => {
  const isReply = parentId !== null;
  const { mutate, isPending, isError, error } = useCreateCommentMutation();
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
    setValue,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: getDefaultValues(parentId),
  });

  useEffect(() => {
    setValue('parentId', parentId ?? undefined);
  }, [parentId, setValue]);

  useEffect(() => {
    if (captcha?.id) {
      setValue('captchaId', captcha.id);
    }
  }, [captcha?.id, setValue]);

  const handleRefreshCaptcha = async (): Promise<void> => {
    setValue('captchaValue', '');

    const { data } = await refetchCaptcha();

    if (data?.id) {
      setValue('captchaId', data.id);
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
      onSuccess: async () => {
        reset(getDefaultValues(parentId));
        setValue('captchaValue', '');

        const { data } = await refetchCaptcha();

        if (data?.id) {
          setValue('captchaId', data.id);
        }

        onSuccess?.();
      },
    });
  };

  const isCaptchaBusy = isCaptchaLoading || isCaptchaFetching;
  const captchaErrorMessage =
    captchaError instanceof Error
      ? captchaError.message
      : 'Failed to load captcha. Please try again.';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        'rounded-lg border border-slate-200',
        isReply ? 'space-y-3 p-3' : 'space-y-4 p-4',
      )}
      noValidate
    >
      {isReply ? (
        <p className="text-xs font-medium text-slate-500">Write a reply</p>
      ) : null}

      {isError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : 'Failed to submit comment. Please try again.'}
        </p>
      ) : null}

      <div
        className={cn(
          'grid gap-4',
          isReply ? 'grid-cols-1 gap-3' : 'sm:grid-cols-2',
        )}
      >
        <div className="space-y-1.5">
          <FieldLabel htmlFor="userName" required>
            Username
          </FieldLabel>
          <Input
            id="userName"
            autoComplete="username"
            disabled={isPending}
            className={isReply ? 'h-8 text-sm' : undefined}
            {...register('userName')}
          />
          <FieldError message={errors.userName?.message} />
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="email" required>
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isPending}
            className={isReply ? 'h-8 text-sm' : undefined}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="homePage">Homepage</FieldLabel>
        <Input
          id="homePage"
          type="url"
          placeholder="https://example.com"
          disabled={isPending}
          className={isReply ? 'h-8 text-sm' : undefined}
          {...register('homePage')}
        />
        <FieldError message={errors.homePage?.message} />
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="text" required>
          Comment
        </FieldLabel>
        <Textarea
          id="text"
          placeholder="Write your comment..."
          disabled={isPending}
          className={isReply ? 'min-h-[72px] text-sm' : undefined}
          {...register('text')}
        />
        <FieldError message={errors.text?.message} />
      </div>

      <div className="space-y-1.5">
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
              className={isReply ? 'h-8 text-xs' : undefined}
              onBlur={onBlur}
              onChange={(event) => {
                const file = event.target.files?.[0];
                onChange(file ?? undefined);
              }}
            />
          )}
        />
        <p className="text-xs text-slate-500">
          JPG, JPEG, GIF, PNG, or TXT (max 100 KB for TXT)
        </p>
        <FieldError message={errors.file?.message} />
      </div>

      <input type="hidden" {...register('captchaId')} />

      <div className="space-y-1.5">
        <FieldLabel htmlFor="captchaValue" required>
          Captcha
        </FieldLabel>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex shrink-0 items-center gap-1.5">
            {isCaptchaError ? (
              <div
                aria-hidden
                className={cn(
                  'flex items-center justify-center rounded-md border border-dashed border-red-200 bg-red-50 text-red-500',
                  isReply ? 'h-10 w-28 text-[10px]' : 'h-12 w-32 text-xs',
                )}
              >
                Load failed
              </div>
            ) : isCaptchaBusy || !captcha?.image ? (
              <div
                aria-hidden
                className={cn(
                  'animate-pulse rounded-md border border-dashed border-slate-300 bg-slate-50',
                  isReply ? 'h-10 w-28' : 'h-12 w-32',
                )}
              />
            ) : (
              <CaptchaImage image={captcha.image} compact={isReply} />
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Refresh captcha"
              disabled={isPending || isCaptchaBusy}
              onClick={() => {
                void handleRefreshCaptcha();
              }}
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4',
                  isCaptchaBusy
                    ? 'animate-spin text-slate-400'
                    : 'text-slate-600',
                )}
              />
            </Button>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <Input
              id="captchaValue"
              placeholder="Enter captcha"
              autoComplete="off"
              disabled={isPending || isCaptchaLoading || isCaptchaError}
              className={isReply ? 'h-8 text-sm' : undefined}
              {...register('captchaValue')}
            />
            <FieldError message={errors.captchaValue?.message} />
            {isCaptchaError ? (
              <p className="text-xs text-red-600">{captchaErrorMessage}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className={cn('flex justify-end', isReply ? 'pt-1' : 'pt-2')}>
        <Button
          type="submit"
          size={isReply ? 'sm' : 'default'}
          disabled={isPending || isCaptchaLoading || isCaptchaError}
        >
          {isPending
            ? 'Submitting...'
            : isReply
              ? 'Post reply'
              : 'Post comment'}
        </Button>
      </div>
    </form>
  );
};
