# 妄想不動産 Web v0.3

理想の住まいを入力・選択し、好きな生成AIへ持ち込む査定依頼書を作る静的サイト。
親プロジェクトは **Daydream Property（デイドリームプロパティ）**。Webサービスのローマ字表記は **Mousou Fudousan**、ローカルフォルダは `Mousou Fudousan`、GitHubリポジトリ名は `mousou-fudousan` です。このフォルダだけを独立したGitリポジトリとして管理します。

## 起動

`dist/index.html` をブラウザで開くだけで利用できます。インストール・ビルドは不要です。
コピーがブラウザに制限される場合は、表示される案内に従って全文をコピーしてください。

ローカルHTTPで確認する場合は、このフォルダで以下を実行します（Python 3が必要）。

```powershell
python -m http.server 4174 --bind 127.0.0.1 --directory dist
```

`http://127.0.0.1:4174/` を開きます。終了は `Ctrl+C`。これは開発用の静的ファイル配信で、アプリのバックエンドではありません。

## 技術と理由

- HTML・CSS・素のJavaScript。小さなフォームと文字列生成にフレームワークは不要で、依存関係・インストール・ビルドを省けます。
- システムフォント、自作SVG、利用者提供の作例PNGと新規生成した特選物件PNGを使用。外部フォントや画像配信、CDNに依存しません。
- 正式プロンプトは `dist/prompt-v0.4.js` に全文保持。通常のscriptとして読み込み、ローカルファイルでもfetchやサーバーなしで動かします。
- 配布対象は `dist/` のみ。相対URLを使用し、公開先やサブディレクトリに依存しません。
- 保存機構、Cookie、アクセス解析、認証、データベース、外部APIはありません。生成AIのリンクを開くまで外部サービスと通信せず、リンクにも入力を載せません。

## 実装した機能

- 自由記入＋6つの任意選択。全未指定や空白のみの場合は理由を示して発行を無効化。
- 指定条件だけを正式v0.4の「お客様の理想の家」に挿入。自由記入は空白・改行を含め原文保持。
- 矛盾する希望があれば自由記入の具体的な希望を優先する指示を追記。
- 発行・全文コピー・折りたたみプレビュー・ChatGPT／Gemini／Claudeへのリンク。
- 入力変更で発行内容を失効し、再発行を要求。コピー直前にも現在の入力と照合。
- コピーAPIが使えない場合はブラウザのコピー処理を試し、失敗した場合は本文を選択して手動コピーを案内。
- 「高級不動産広告 × 空想の査定窓口」をコンセプトに、深緑・アイボリー・控えめなゴールドで構成。PCでは特選物件とフォームを左右に並べ、フォーム全体を囲む白いカードは使わず、入力欄だけを白く表示。
- スマートフォンでは見出し、フォーム、特選物件の順に表示。PCの選択欄は3列、狭幅では2列。
- 特選物件 No.001「月影の迎賓館」は、森の中の歴史ある大邸宅。外観と査定所見の対比で架空査定額2,800万円の理由を伝える。専用の文字なし画像を新規生成して使用。
- 物件選集は歴史ある洋館「翠影館」、現代の小さな住宅「余白の家」、ファンタジーの住まい「星渡りの塔」の3件。PCは横並び、スマートフォンは縦並び。
- 作例画像枠は全件3:2。提供された横長の翠影館でも建物の主要部分を残せる比率とし、`object-fit: cover` と物件別の `object-position` でトリミング。物件名・査定額はHTMLで表示。
- 査定額・コメントは紹介用に作成したフィクションで、実際のAI査定結果ではありません。下段の3画像は利用者提供のAI生成イメージ（`mousou_property_examples.zip` 内のPNG原本）を加工せず使用。特選物件の画像は新規生成し、`dist/images/` に配置。Web画像の取得はしていません。

公開前の確認で、スマートフォン向けの文字サイズとコピー失敗時の手動コピー案内を調整しました。`app.js` の変更は案内表示のみで、依頼書の生成処理と正式共通プロンプト `prompt-v0.4.js` は変更していません。

特選物件画像はbuilt-in `image_gen` で生成しました。最終プロンプト：

```text
Use case: photorealistic-natural. Asset type: wide featured-property photograph for an elegant fictional luxury real estate website. Create a newly generated, photorealistic editorial architecture photograph of a very large historic reception mansion deep in a forest: approximately 1,200 square meters, stately stone facade, symmetrical wings, tall windows, grand entry steps, mature trees, well-kept grounds. The building is intact and well maintained, dignified and clearly expensive at first glance. Wide horizontal architectural composition with the complete main building visible and breathing room for responsive cropping to a 16:10 website frame. Camera at a slightly low but natural eye-level angle, warm late afternoon overcast light, dark forest green, stone and muted ivory tones, refined real-estate catalog photography, realistic materials and scale. No people, ghosts, ballroom scene, occult symbols, theatrical horror lighting, text, letters, numerals, signs, plaques, nameplates, watermark or logo. The peculiar overnight ballroom and appraisal price belong only in accompanying web copy, not in the image.
```

## ファイル

```text
.gitignore
README.md
VERIFICATION.md
.github/
  workflows/pages.yml  GitHub Pages用の配信設定（distのみ）
dist/
  index.html       日本語UI・作例
  styles.css       レスポンシブ表示
  app.js           発行・入力状態・コピー処理
  prompt-v0.4.js   提供された正式プロンプト全文
  favicon.svg      自作のサイトアイコン
  images/
    sueikan.png              翠影館（提供画像）
    yohaku_no_ie.png          余白の家（提供画像）
    hoshiwatari_no_tou.png    星渡りの塔（提供画像）
    tsukikage_geihinkan.png   月影の迎賓館（新規生成画像）
tests/
  request.test.cjs 文字列生成の回帰テスト
```

## 検証

Node.jsがある場合、追加パッケージなしでテストできます。

```powershell
node --test tests/request.test.cjs
```

実施結果と環境差による未検証事項は `VERIFICATION.md` を参照してください。

## GitHub Pages公開

サイト：[妄想不動産](https://nempro.github.io/mousou-fudousan/) ／ リポジトリ：[nempro/mousou-fudousan](https://github.com/nempro/mousou-fudousan)

GitHub Pagesの公開元はGitHub Actionsです。`.github/workflows/pages.yml` が `main` の `dist/` の中身をサイトのルートとして配信します。HTML内のCSS・JavaScript・favicon・画像は相対パスで、ビルドや追加パッケージは不要です。`main` へのpushで再配信されます。公開URLでの確認結果は `VERIFICATION.md` に記録しています。

サイトは創作上の娯楽であり、実際の不動産鑑定ではありません。

サイト内AI査定・画像生成、ログイン、履歴、投稿、サーバーへの入力保存、3D家づくりは対象外です。
