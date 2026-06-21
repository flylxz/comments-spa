#!/usr/bin/env python3
"""XML fallback builder for comments-spa.mwb when MySQL Workbench is unavailable."""

from __future__ import annotations

import sqlite3
import tempfile
import uuid
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "comments-spa.mwb"
SCHEMA_NAME = "comments_spa"
TABLE_NAME = "Comment"

COLUMNS: tuple[tuple[str, str, bool, bool, str | None], ...] = (
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


def oid() -> str:
    return "{" + str(uuid.uuid4()).upper() + "}"


def grt_version_xml(
    version_id: str,
    owner_id: str,
    major: int,
    minor: int,
    release: int,
    *,
    key: str | None = None,
    build: int = 0,
    status: int = 0,
) -> str:
    key_attr = f' key="{key}"' if key else ""
    return f"""
          <value type="object" struct-name="GrtVersion" id="{version_id}" struct-checksum="0x0"{key_attr}>
            <value type="int" key="buildNumber">{build}</value>
            <value type="int" key="majorNumber">{major}</value>
            <value type="int" key="minorNumber">{minor}</value>
            <value type="int" key="releaseNumber">{release}</value>
            <value type="int" key="status">{status}</value>
            <link type="object" struct-name="GrtObject" key="owner">{owner_id}</link>
          </value>"""


def column_xml(
    column_id: str,
    table_id: str,
    name: str,
    datatype: str,
    not_null: bool,
    auto_increment: bool,
    default_value: str | None,
) -> str:
    default_block = ""
    if default_value is not None:
        default_block = f"""
    <value type="string" key="defaultValue">{default_value}</value>
    <value type="string" key="defaultValueIsNull">0</value>"""

    return f"""
  <value type="object" struct-name="db.mysql.Column" id="{column_id}" struct-checksum="0x0">
    <value type="string" key="name">{name}</value>
    <value type="string" key="comment"></value>
    <value type="string" key="oldName"></value>
    <value _ptr_="0x0" type="dict" key="customData"/>
    <value type="int" key="isNotNull">{1 if not_null else 0}</value>
    <value type="int" key="autoIncrement">{1 if auto_increment else 0}</value>
    <value type="int" key="generated">0</value>
    <value type="string" key="expression"></value>
    <value type="int" key="precision">-1</value>
    <value type="int" key="scale">-1</value>
    <value type="int" key="length">-1</value>
    <value type="string" key="datatype">{datatype}</value>
    <value type="string" key="characterSetName"></value>
    <value type="string" key="collationName"></value>{default_block}
    <link type="object" struct-name="GrtObject" key="owner">{table_id}</link>
  </value>"""


def build_document_xml() -> str:
    doc_id = oid()
    logical_model_id = oid()
    physical_model_id = oid()
    catalog_id = oid()
    schema_id = oid()
    table_id = oid()
    diagram_id = oid()
    layer_id = oid()
    table_figure_id = oid()
    pk_index_id = oid()
    pk_index_column_id = oid()
    fk_id = oid()
    doc_version_id = oid()
    catalog_version_id = oid()

    column_ids = [oid() for _ in COLUMNS]
    id_column_id = column_ids[0]
    parent_id_column_id = column_ids[9]

    columns_xml = "".join(
        column_xml(
            column_ids[index],
            table_id,
            name,
            datatype,
            not_null,
            auto_increment,
            default_value,
        )
        for index, (name, datatype, not_null, auto_increment, default_value) in enumerate(COLUMNS)
    )

    catalog_version_xml = grt_version_xml(
        catalog_version_id, catalog_id, 8, 0, 47, key="version"
    )
    document_version_xml = grt_version_xml(doc_version_id, doc_id, 1, 4, 4, key="version")

    return f"""<?xml version="1.0"?>
<data grt_format="2.0" document_type="MySQL Workbench Model" version="1.4.4">
  <value type="object" struct-name="workbench.Document" id="{doc_id}" struct-checksum="0x7131bf99">
    <value type="object" struct-name="workbench.logical.Model" id="{logical_model_id}" struct-checksum="0xf4220370" key="logicalModel">
      <value _ptr_="0x0" type="list" content-type="object" content-struct-name="workbench.logical.Diagram" key="diagrams"/>
      <value _ptr_="0x0" type="dict" key="customData"/>
      <value _ptr_="0x0" type="list" content-type="object" content-struct-name="model.Marker" key="markers"/>
      <value _ptr_="0x0" type="dict" key="options"/>
      <value type="string" key="name"></value>
      <link type="object" struct-name="GrtObject" key="owner">{doc_id}</link>
    </value>
    <value _ptr_="0x0" type="list" content-type="object" content-struct-name="workbench.physical.Model" key="physicalModels">
      <value type="object" struct-name="workbench.physical.Model" id="{physical_model_id}" struct-checksum="0x0">
        <value type="string" key="name">comments_spa</value>
        <value _ptr_="0x0" type="dict" key="customData"/>
        <value type="object" struct-name="db.mysql.Catalog" id="{catalog_id}" struct-checksum="0x0" key="catalog">
          <value type="string" key="name"></value>{catalog_version_xml}
          <value type="string" key="defaultCharacterSetName">utf8mb4</value>
          <value type="string" key="defaultCollationName">utf8mb4_unicode_ci</value>
          <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.LogFileGroup" key="logFileGroups"/>
          <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Schema" key="schemata">
            <value type="object" struct-name="db.mysql.Schema" id="{schema_id}" struct-checksum="0x0">
              <value type="string" key="name">{SCHEMA_NAME}</value>
              <value type="string" key="oldName"></value>
              <value type="string" key="comment"></value>
              <value _ptr_="0x0" type="dict" key="customData"/>
              <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Table" key="tables">
                <value type="object" struct-name="db.mysql.Table" id="{table_id}" struct-checksum="0x0">
                  <value type="string" key="name">{TABLE_NAME}</value>
                  <value type="string" key="oldName"></value>
                  <value type="string" key="comment">Top-level comments and nested replies (self-referencing parentId)</value>
                  <value _ptr_="0x0" type="dict" key="customData"/>
                  <value type="string" key="temp_sql"></value>
                  <value type="string" key="tableEngine">InnoDB</value>
                  <value type="string" key="characterSetName">utf8mb4</value>
                  <value type="string" key="collationName">utf8mb4_unicode_ci</value>
                  <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Column" key="columns">{columns_xml}
                  </value>
                  <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Index" key="indices">
                    <value type="object" struct-name="db.mysql.Index" id="{pk_index_id}" struct-checksum="0x0">
                      <value type="string" key="name">PRIMARY</value>
                      <value type="string" key="oldName"></value>
                      <value type="string" key="comment"></value>
                      <value _ptr_="0x0" type="dict" key="customData"/>
                      <value type="int" key="unique">1</value>
                      <value type="int" key="primary">1</value>
                      <value type="int" key="type">1</value>
                      <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.IndexColumn" key="columns">
                        <value type="object" struct-name="db.mysql.IndexColumn" id="{pk_index_column_id}" struct-checksum="0x0">
                          <value type="string" key="name"></value>
                          <value type="int" key="descend">0</value>
                          <value type="int" key="length">0</value>
                          <link type="object" struct-name="db.mysql.Column" key="referencedColumn">{id_column_id}</link>
                          <link type="object" struct-name="GrtObject" key="owner">{pk_index_id}</link>
                        </value>
                      </value>
                      <link type="object" struct-name="GrtObject" key="owner">{table_id}</link>
                    </value>
                  </value>
                  <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.ForeignKey" key="foreignKeys">
                    <value type="object" struct-name="db.mysql.ForeignKey" id="{fk_id}" struct-checksum="0x0">
                      <value type="string" key="name">Comment_parentId_fkey</value>
                      <value type="string" key="oldName"></value>
                      <value type="string" key="comment"></value>
                      <value _ptr_="0x0" type="dict" key="customData"/>
                      <value type="string" key="referencedTableName">{TABLE_NAME}</value>
                      <value type="string" key="deleteRule">CASCADE</value>
                      <value type="string" key="updateRule">CASCADE</value>
                      <value type="int" key="modelOnly">0</value>
                      <value type="int" key="deferability">0</value>
                      <value type="int" key="mandatory">0</value>
                      <value type="int" key="many">0</value>
                      <value type="int" key="referencedMandatory">1</value>
                      <link type="object" struct-name="db.mysql.Table" key="referencedTable">{table_id}</link>
                      <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Column" key="columns">
                        <link type="object" struct-name="db.mysql.Column">{parent_id_column_id}</link>
                      </value>
                      <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Column" key="referencedColumns">
                        <link type="object" struct-name="db.mysql.Column">{id_column_id}</link>
                      </value>
                      <link type="object" struct-name="GrtObject" key="owner">{table_id}</link>
                    </value>
                  </value>
                  <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Trigger" key="triggers"/>
                  <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.View" key="views"/>
                  <link type="object" struct-name="GrtObject" key="owner">{schema_id}</link>
                </value>
              </value>
              <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.View" key="views"/>
              <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.RoutineGroup" key="routineGroups"/>
              <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Routine" key="routines"/>
              <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Synonym" key="synonyms"/>
              <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Sequence" key="sequences"/>
              <link type="object" struct-name="GrtObject" key="owner">{catalog_id}</link>
            </value>
          </value>
          <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.ServerLink" key="serverLinks"/>
          <value _ptr_="0x0" type="list" content-type="object" content-struct-name="db.mysql.Tablespace" key="tablespaces"/>
          <link type="object" struct-name="GrtObject" key="owner">{physical_model_id}</link>
        </value>
        <value _ptr_="0x0" type="list" content-type="object" content-struct-name="workbench.physical.Diagram" key="diagrams">
          <value type="object" struct-name="workbench.physical.Diagram" id="{diagram_id}" struct-checksum="0x0">
            <value type="string" key="name">EER Diagram</value>
            <value _ptr_="0x0" type="dict" key="customData"/>
            <value _ptr_="0x0" type="list" content-type="object" content-struct-name="model.Layer" key="layers">
              <value type="object" struct-name="model.Layer" id="{layer_id}" struct-checksum="0x0">
                <value type="string" key="name"></value>
                <value type="real" key="x">0</value>
                <value type="real" key="y">0</value>
                <value type="real" key="width">0</value>
                <value type="real" key="height">0</value>
                <value type="real" key="color">#FFFFFF</value>
                <value _ptr_="0x0" type="list" content-type="object" content-struct-name="model.Figure" key="figures">
                  <value type="object" struct-name="workbench.physical.TableFigure" id="{table_figure_id}" struct-checksum="0x0">
                    <value type="real" key="x">200</value>
                    <value type="real" key="y">200</value>
                    <value type="real" key="width">160</value>
                    <value type="real" key="height">280</value>
                    <value type="real" key="color">#98BFDA</value>
                    <value type="string" key="caption">{TABLE_NAME}</value>
                    <value type="int" key="expanded">1</value>
                    <link type="object" struct-name="db.mysql.Table" key="table">{table_id}</link>
                    <link type="object" struct-name="GrtObject" key="owner">{layer_id}</link>
                  </value>
                </value>
                <value _ptr_="0x0" type="list" content-type="object" content-struct-name="model.Connection" key="connections"/>
                <link type="object" struct-name="GrtObject" key="owner">{diagram_id}</link>
              </value>
            </value>
            <value _ptr_="0x0" type="list" content-type="object" content-struct-name="model.Marker" key="markers"/>
            <link type="object" struct-name="GrtObject" key="owner">{physical_model_id}</link>
          </value>
        </value>
        <link type="object" struct-name="GrtObject" key="owner">{doc_id}</link>
      </value>
    </value>
    <value _ptr_="0x0" type="dict" key="pluginData"/>{document_version_xml}
  </value>
</data>
"""


def create_data_db(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.execute("CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT)")
    connection.commit()
    connection.close()


def build_mwb(output: Path) -> None:
    document_xml = build_document_xml()

    with tempfile.TemporaryDirectory(prefix="mwb-build-") as temp_dir:
        temp_path = Path(temp_dir)
        data_db_path = temp_path / "@db" / "data.db"
        xml_path = temp_path / "document.mwb.xml"

        data_db_path.parent.mkdir(parents=True, exist_ok=True)
        xml_path.write_text(document_xml, encoding="utf-8")
        create_data_db(data_db_path)

        with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.comment = b"MySQL Workbench Model archive 1.0"
            archive.write(xml_path, arcname="document.mwb.xml")
            archive.write(data_db_path, arcname="@db/data.db")


def main() -> None:
    build_mwb(OUTPUT)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
