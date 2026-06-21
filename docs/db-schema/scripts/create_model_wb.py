# -*- coding: utf-8 -*-
"""Create comments-spa.mwb via MySQL Workbench GRT API (run with Workbench -run-script)."""

from __future__ import print_function

import grt
from grt.modules import Workbench

OUTPUT = "/Users/front.end.aam.dzencode/Documents/Practice/comments-spa/docs/db-schema/comments-spa.mwb"
SCHEMA_NAME = "comments_spa"
TABLE_NAME = "Comment"

COLUMNS = (
    ("id", "INT", True, True, None),
    ("userName", "TEXT", True, False, None),
    ("email", "TEXT", True, False, None),
    ("homePage", "TEXT", False, False, None),
    ("text", "TEXT", True, False, None),
    ("fileUrl", "TEXT", False, False, None),
    ("fileName", "TEXT", False, False, None),
    ("fileSize", "INT", False, False, None),
    ("createdAt", "DATETIME", True, False, "CURRENT_TIMESTAMP"),
    ("parentId", "INT", False, False, None),
)


def add_column(table, datatypes, name, datatype, not_null, auto_increment, default_value):
    column = grt.classes.db_mysql_Column()
    column.name = name
    table.addColumn(column)
    column.setParseType(datatype, datatypes)
    if not_null:
        column.isNotNull = 1
    if auto_increment:
        column.autoIncrement = 1
    if default_value is not None:
        column.defaultValue = default_value
    return column


def build_model():
    Workbench.openNewModelDiagram()

    schema = grt.root.wb.doc.physicalModels[0].catalog.schemata[0]
    schema.name = SCHEMA_NAME

    datatypes = grt.root.wb.rdbmsMgmt.rdbms[0].simpleDatatypes

    table = grt.classes.db_mysql_Table()
    table.name = TABLE_NAME
    table.comment = "Top-level comments and nested replies (self-referencing parentId)"
    table.tableEngine = "InnoDB"
    schema.addTable(table)

    created_columns = {}
    for name, datatype, not_null, auto_increment, default_value in COLUMNS:
        created_columns[name] = add_column(
            table,
            datatypes,
            name,
            datatype,
            not_null,
            auto_increment,
            default_value,
        )

    table.addPrimaryKeyColumn(created_columns["id"])

    foreign_key = table.createForeignKey("Comment_parentId_fkey")
    foreign_key.referencedTable = table
    foreign_key.columns.append(created_columns["parentId"])
    foreign_key.referencedColumns.append(created_columns["id"])
    foreign_key.deleteRule = "CASCADE"
    foreign_key.updateRule = "CASCADE"

    Workbench.saveModelAs(OUTPUT)
    print("Saved model to", OUTPUT)


build_model()
