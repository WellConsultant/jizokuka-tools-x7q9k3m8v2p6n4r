(function(){
  const caseId=new URLSearchParams(location.search).get("case")||"default",storageKey="shoryokuka-hearing-phases-v2-"+caseId;
  function read(){try{const raw=localStorage.getItem(storageKey);const current=raw?JSON.parse(raw):{};if(caseId!=="default")return current;const oldRaw=localStorage.getItem("shoryokuka-hearing-phases-v1");if(!oldRaw)return current;const old=JSON.parse(oldRaw);const currentHas=Boolean(Object.keys(current.snapshots||{}).length||Object.keys(current.drafts||{}).length);if(currentHas)return current;localStorage.setItem(storageKey,JSON.stringify(old));return old}catch(e){return {}}}
  function send(){if(window.parent!==window)window.parent.postMessage({type:"shoryokuka-hearing-state",caseId,state:read()},"*")}
  if(window.parent!==window){
    window.addEventListener("message",e=>{if(e.data&&e.data.type==="shoryokuka-hearing-request"&&(!e.data.caseId||e.data.caseId===caseId))send()});
    document.addEventListener("click",e=>{if(e.target.id==="savePhase"||e.target.id==="copy")setTimeout(send,150)});
    document.addEventListener("input",e=>{if(e.target.matches("textarea[data-key]"))setTimeout(send,300)});
    setTimeout(send,300);
  }else{
    window.addEventListener("message",e=>{if(e.data&&e.data.type==="shoryokuka-hearing-state"&&(!e.data.caseId||e.data.caseId===caseId))document.dispatchEvent(new CustomEvent("hearingstate",{detail:e.data.state||{}}))});
    document.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>document.querySelector("iframe")?.contentWindow?.postMessage({type:"shoryokuka-hearing-request",caseId},"*"),500);setInterval(()=>document.dispatchEvent(new CustomEvent("hearingstate",{detail:read()})),500)});
  }
})();
