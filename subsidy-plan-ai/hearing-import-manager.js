(function(){
  function whenReady(fn){document.addEventListener("DOMContentLoaded",fn)}
  async function pdfText(bytes){if(!window.pdfjsLib)throw new Error("PDF読込機能を読み込めません");pdfjsLib.GlobalWorkerOptions.workerSrc="pdf.worker.min.js";const doc=await pdfjsLib.getDocument({data:bytes}).promise,parts=[];for(let p=1;p<=doc.numPages;p++){const page=await doc.getPage(p),content=await page.getTextContent();parts.push("[PDF "+p+"ページ]\n"+content.items.map(x=>x.str).join(" "))}return parts.join("\n\n")}
  async function one(name,bytes){const lower=name.toLowerCase();if(lower.endsWith(".pdf"))return await pdfText(bytes);if(lower.endsWith(".zip")){if(!window.JSZip)throw new Error("ZIP展開機能を読み込めません");const zip=await JSZip.loadAsync(bytes),out=[];for(const n of Object.keys(zip.files)){const f=zip.files[n];if(f.dir||!(/\.(txt|md|json|csv|html?|pdf)$/i.test(n)))continue;out.push("[ZIP内: "+n+"]\n"+await one(n,await f.async("uint8array")))}return out.join("\n\n")}return new TextDecoder().decode(bytes)}
  const rules={
    事業者情報:/商号|会社名|代表|所在地|住所|業種|設立|法人番号/,
    役員従業員:/役員|従業員|社員|人員|人数/,
    事業内容:/事業内容|事業概要|商品|サービス|顧客|業務/,
    強み競争優位性:/強み|競争優位|差別化|得意|実績/,
    市場競争環境:/市場|競争環境|顧客ニーズ|競合|外部環境/,
    経営課題:/経営課題|課題|問題|困り|人手不足/,
    省力化業務と注力業務:/省力化|効率化|自動化|注力|再配置/,
    ボトルネック:/ボトルネック|滞留|手作業|負荷|時間がかか/,
    導入設備と金額:/導入設備|機械|装置|システム|見積|金額|投資/,
    専用性独自性:/専用|カスタマイズ|オーダーメイド|組み合わせ|独自性/,
    ビフォーアフター:/導入前|導入後|ビフォー|アフター|人員配置/,
    省力化指数根拠:/省力化指数|作業時間|稼働日|人件費単価/,
    省力化効果:/効果|削減率|処理件数|売上|利益/,
    経営資源再配置:/経営資源|労働力|浮いた時間|再配置|高付加価値/,
    付加価値創出:/付加価値|新規顧客|新商品|新サービス|新市場/,
    人材育成:/人材育成|研修|デジタルスキル|専門技術/,
    価格サービス戦略:/価格|サービス向上|料金|販売/,
    投資資金計画:/資金調達|自己資金|借入|補助申請|投資総額/,
    代替策投資回収:/代替策|投資回収|回収期間/,
    数値計画:/数値計画|労働生産性|営業利益|付加価値額|給与支給総額/,
    賃上げ目標根拠:/賃上げ|給与|4%|目標/,
    実施体制:/実施体制|責任者|担当者|外部連携|技術力/,
    実施スケジュール:/スケジュール|要件定義|発注|設置|テスト|稼働/,
    リスク対応:/リスク|対応策|成果が出な/,
    中期計画:/中期|3〜5年|会社全体|最適化/,
    本人確認:/本人|理解|実行可能|支援者/
  };
  function organize(text){const chunks=text.split(/\n{2,}|\n/).map(x=>x.trim()).filter(Boolean),result={};Object.entries(rules).forEach(([key,re])=>{const hits=chunks.filter(x=>re.test(x)&&!x.startsWith("[PDF ")).slice(0,4);if(hits.length)result[key]="【資料から自動整理・要確認】\n"+hits.join("\n")});return result}
  whenReady(()=>{const card=document.createElement("section");card.className="card";card.innerHTML='<h2>資料・Brainデータの読み込み</h2><p>会話記録、各種データ、Brainの基本データを、ユーザーが選択したローカルファイルから読み込みます。TXT・MD・JSON・CSV・HTML・PDF・ZIPに対応し、ZIPは対応ファイルを展開します。原本は変更せず、読み込んだ内容は現在のフェーズへ追加保存します。抽出した内容は該当する入力欄へ「資料から自動整理・要確認」として追加します。</p><div class="q"><label>読み込む資料（複数選択可）</label><input id="sourceFiles" type="file" multiple accept=".txt,.md,.json,.csv,.html,.htm,.pdf,.zip"><small id="importState">まだ資料を読み込んでいません</small></div><div class="q"><label>自動抽出結果</label><textarea id="importedSource" data-key="読み込み資料" style="min-height:180px" placeholder="選択した資料の抽出結果がここに追加されます"></textarea></div>';const main=document.querySelector("main.wrap");main.insertBefore(card,main.querySelector("section"));const input=card.querySelector("#sourceFiles"),out=card.querySelector("#importedSource"),status=card.querySelector("#importState"),boxes=[...document.querySelectorAll("textarea[data-key]")];input.onchange=async()=>{const files=[...input.files];try{const parts=[];for(const f of files)parts.push("【出所: "+f.name+"／読込日時: "+new Date().toLocaleString("ja-JP")+"】\n"+await one(f.name,new Uint8Array(await f.arrayBuffer())));const extracted=parts.join("\n\n");out.value=(out.value?out.value+"\n\n":"")+extracted;out.dispatchEvent(new Event("input",{bubbles:true}));const organized=organize(extracted);Object.entries(organized).forEach(([key,value])=>{const box=boxes.find(x=>x.dataset.key===key);if(box&&!box.value.includes(value))box.value=(box.value?box.value+"\n\n":"")+value;box?.dispatchEvent(new Event("input",{bubbles:true}))});status.textContent=files.length+"件を抽出し、"+Object.keys(organized).length+"項目へ自動整理しました。内容を確認してフェーズを保存してください。"}catch(e){status.textContent="読み込み失敗："+e.message}}})
})();
