---
title: "[WIP] Microsoft REST API Guidelines を読もう"
date: "2022-07-15"
---

Microsoft REST API Guidelines を読んで気になったところメモ。

https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md

## 6. Client guidance

### 6.1 Ignore rule

> クライアントは、未知のフィールドを無視しなければならない。(MUST)

APIのレスポンスに新規フィールドを追加したときに、エラーを起こさないため？

## 7. Consistency fundamentals

### 7.3 Canonical identifier

> 移動したり名前を変更したりできるリソースは、一意の識別子を含むURLも公開するべき。(SHOULD)

このとき、識別子は GUID でなくてもよい。

ユーザーフレンドリーな構造化されたURL :
~~~
https://api.contoso.com/v1.0/people/jdoe@contoso.com/inbox
~~~

識別子で表現したURL :
~~~
https://api.contoso.com/v1.0/people/7011042402/inbox
~~~

### 7.4 Supported methods

> 操作は可能な限り適切なHTTPメソッドを使用しなければならず(MUST)、操作の冪等性は尊重されなければならない。(MUST)

以下のメソッドを使用するすべてのリソースは、その使用方法に準拠しなければならない。

Method  | Description                                                    | 冪等性
------- | -------------------------------------------------------------- | -------------
GET     | オブジェクトの現在の値を返す                                      | True
PUT     | オブジェクトを置き換える。該当するオブジェクトが無ければ、作成する   | True
DELETE  | オブジェクトを削除する                                           | True
POST    | オブジェクトを作成する                                           | False
HEAD    | GETレスポンスに対して、オブジェクトのメタデータを返す               | True
PATCH   | オブジェクトの一部をアップデートする                              | False
OPTIONS | リクエストに関する情報を取得する                                  | True

#### 7.4.1 POST

`POST` のレスポンスには、作成したデータの情報を返すとよい


ここまで読んだ

https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#78-specifying-headers-as-query-parameters