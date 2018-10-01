# この文章の目的
赤福WebExtension版に機能提案するにあたり  
コードだけではわかりにくいと考えたものを説明します。

### 処理の流れとディレクトリ構成について
manifest.json からたどっていただけると処理の流れがわかると思います。  
大まかに箇条書きすると  

1. 右クリックメニューに追加 (backgroud script)
1. 右クリックメニューからリーダーのhtmlを開く
1. リーダーのhtmlからドロップイベントを処理する js が読み込まれる
1. ドロップされたら上記jsでmhtからhtmlに変換してスレッドhtmlを起動
1. スレッドhtml上に元画像表示のためのjsを付加

という流れです。  

赤福の構成がよくわかってないので、こちらからは特に  
ディレクトリを切って整頓せずに全部平に置いています。

### mhtファイルの扱い方
空白ページへのドロップは対応できませんが、  
Firefoxでファイルを扱う機能は変わらず(当然ですが)存在しているので  
例えばドロップイベントを使えばmhtファイルを扱うことができます。  

このアドオンでは[Extension pages](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Extension_pages)を使ってUIを用意しました。

### リーダーの起動方法
このプロトタイプでは(何も考えず)右クリックのメニューに追加しましたが  
利用者にとって便利な最善の方法が良いと思います。

- オプションページでボタンクリックして起動
- オプションページにリーダーを埋め込む
  - 現在のWebExtensions版の赤福のように個別でオプションページを開く場合ドロップUIを組み込めます
- ショートカットで起動
  - たぶん全然よくない
- やはり右クリックのメニューにする
- etc.

### 元画像表示について
クリックしたときにimg(またはvideo)タグを作成して表示してます。  
過去にatagのhrefにobjectURLを指定して開けるようにしたことがありますが、

- adblockによって開く動作が阻害される例がある
- サイズの大きい動画は再生されない

といった問題に遭遇したためこのような方式にしました。  
ちなみにdataURLをhrefに直に指定したときはブラウザの挙動が重くなりました。  

掲示板と同じ仕様が良いと思いますが、単に納得できる実装ができなかったので  
このような実装になっています。

### 赤福の引用機能などをつけるために
元画像表示のためのjsは [tabs.executeScript()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/executeScript) で付加してます。  
同様に引用の機能をつけられると思います。

### 参考にした資料など
- [mht の rfc](https://tools.ietf.org/html/rfc2557)
- [MAFF file format](http://maf.mozdev.org/)
- [mhtml2html (npm)](https://www.npmjs.com/package/mhtml2html)
- [MHTML Parser (npm, nodejs)](https://www.npmjs.com/package/mhtml-parser)
- [MHT to PDF](https://www.pdfconvertonline.com/mht-to-pdf-online.html)

mhtmlをhtmlに変換するライブラリなどはざっと確認した範囲では  
使うにはイマイチな気がして自作しました。とりあえずリンク掲載しておきます。
