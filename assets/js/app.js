(function(){
"use strict";
var $=function(id){return document.getElementById(id);};
var lastReport="";
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").slice(0,400);}
function activeTab(){var b=document.querySelector('[role=tab][aria-selected=true]');return b?b.getAttribute("data-tab"):"html";}
function setTab(name){document.querySelectorAll('[role=tab]').forEach(function(b){var on=b.getAttribute("data-tab")===name;b.classList.toggle("active",on);b.classList.toggle("btn-dark",on);b.classList.toggle("btn-outline-dark",!on);b.setAttribute("aria-selected",on?"true":"false");b.tabIndex=on?0:-1;var p=document.getElementById(b.getAttribute("aria-controls"));if(p){if(on){p.removeAttribute("hidden");}else{p.setAttribute("hidden","");}}});}
document.querySelectorAll('[role=tab]').forEach(function(b){b.addEventListener("click",function(){setTab(b.getAttribute("data-tab"));});b.addEventListener("keydown",function(e){var tabs=Array.prototype.slice.call(document.querySelectorAll('[role=tab]'));var i=tabs.indexOf(b);if(e.key==="ArrowRight"){e.preventDefault();var n=tabs[(i+1)%tabs.length];setTab(n.getAttribute("data-tab"));n.focus();}if(e.key==="ArrowLeft"){e.preventDefault();var p=tabs[(i-1+tabs.length)%tabs.length];setTab(p.getAttribute("data-tab"));p.focus();}});});
function showErr(m){var e=$("errorBox");e.textContent=m;e.classList.remove("d-none");}
function clearErr(){var e=$("errorBox");e.textContent="";e.classList.add("d-none");}
function say(m){$("fetchStatus").textContent=m;}
function getLevel(){var r=document.querySelector('input[name=level]:checked');return r?r.value:"A";}
function getSev(){var r=document.querySelector('input[name=sev]:checked');return r?r.value:"all";}
function rank(l){return l==="A"?1:l==="AA"?2:3;}
function passSev(f){var s=getSev();if(s==="all")return true;if(s==="P0")return f.sev==="P0";if(s==="P1")return f.sev==="P0"||f.sev==="P1";return true;}
function passLvl(f){var want=getLevel();return rank(f.level)>=rank(want);}
function markDirty(){if(lastReport){$("btnApply").disabled=false;say("Filters changed. Choose Apply filters to update results.");}}
function setStep(n){[["step1",1],["step2",2],["step3",3]].forEach(function(p){var el=$(p[0]);if(!el)return;if(p[1]===n){el.setAttribute("aria-current","step");el.classList.add("fw-bold");}else{el.removeAttribute("aria-current");el.classList.remove("fw-bold");}});}
try{var savedTheme=localStorage.getItem("ada-theme");if(savedTheme){document.body.setAttribute("data-theme",savedTheme);}var ts=$("themeSelect");if(ts&&savedTheme)ts.value=savedTheme;}catch(e){}
var ts=$("themeSelect");if(ts){ts.addEventListener("change",function(){var v=ts.value;if(v==="default"){document.body.removeAttribute("data-theme");}else{document.body.setAttribute("data-theme",v);}try{localStorage.setItem("ada-theme",v);}catch(e){}say("Appearance set.");});}
function findAll(re,src){var out=[],m;re=new RegExp(re.source,re.flags.indexOf("g")>-1?re.flags:re.flags+"g");while((m=re.exec(src))){var line=(src.substring(0,m.index).match(/\n/g)||[]).length+1;out.push("Line "+line+": "+m[0]);if(out.length>=8)break;}return out;}
function audit(html){ return new Promise(function(resolve) {
var doc;try{doc=new DOMParser().parseFromString(html,"text/html");}catch(e){doc=null;}
var F=[];function fmt(el){var h=el.outerHTML;if(!h)return "";var raw=h.replace(/></g,"> <");var idx=html.indexOf(raw.substring(0,20));if(idx<0)idx=html.indexOf("<"+el.tagName.toLowerCase());var line=idx>-1?(html.substring(0,idx).match(/\n/g)||[]).length+1:"?";return "Line "+line+": "+h.slice(0,200);}
function push(id,title,sc,level,sev,ok,count,ev,fix){F.push({id:id,title:title,sc:sc,level:level,sev:sev,ok:ok,count:count,ev:ev||[],fix:fix});}
var hasSkip=/skip[^<]{0,40}content|href="#main/i.test(html);
push("bypass","Bypass block / skip link","2.4.1","A","P0",hasSkip,hasSkip?1:1,hasSkip?[]:["No skip link found"],"Add skip link to #main.");
var h1c=doc?doc.querySelectorAll("h1").length:(html.match(/<h1[\s>]/gi)||[]).length;
push("h1","One h1 per view","1.3.1","A","P0",h1c===1,h1c,["h1 count="+h1c],"Use one h1 per view, then h2, h3 in order.");
var heads=doc?Array.prototype.map.call(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"),function(h){return h.tagName;}):[];
var skipLvl=false;for(var i=1;i<heads.length;i++){if(parseInt(heads[i].slice(1),10)-parseInt(heads[i-1].slice(1),10)>1){skipLvl=true;break;}}
push("head-order","Heading order, no skipped levels","1.3.1","A","P0",!skipLvl,skipLvl?1:0,skipLvl?["Seq: "+heads.slice(0,8).join(" > ")]:[],"Fix order h1>h2>h3.");
var langOk=/<html[^>]*lang="/i.test(html);
push("lang","html lang attribute","3.1.1","A","P0",langOk,langOk?0:1,[],"Use html lang=en.");
var titleOk=doc?!!(doc.querySelector("title")&&doc.querySelector("title").textContent.trim()):/<title>[^<]+<\/title>/i.test(html);
push("title","Descriptive page title","2.4.2","A","P1",titleOk,titleOk?0:1,[],"Set unique title per view.");
var imgs=doc?doc.querySelectorAll("img"):[];var badImg=0,evImg=[];
Array.prototype.forEach.call(imgs,function(im){var a=im.getAttribute("alt");if(a===null||/^(preview|image|photo|logo|spacer|blank|icon|picture)$/i.test(a||"")){badImg++;if(evImg.length<6)evImg.push(esc(fmt(im)));}});
push("alt","Image alt, meaningful","1.1.1","A","P0",badImg===0,badImg,evImg,"Sync alt from library. Never alt=preview, image, logo, etc.");
var btns=doc?doc.querySelectorAll("button"):[];var badBtn=0,evBtn=[];
Array.prototype.forEach.call(btns,function(b){if(!(b.getAttribute("aria-label")||b.textContent||"").trim()){badBtn++;if(evBtn.length<6)evBtn.push(esc(fmt(b)));}});
push("btn-name","Buttons have names","4.1.2","A","P0",badBtn===0,badBtn,evBtn,"Add aria-label + aria-expanded/pressed.");
var iconExp=(html.match(/<i class="bi [^"]*"><\/i>/g)||[]).length;var iconHid=(html.match(/aria-hidden="true"/g)||[]).length;
push("icon-hidden","Decorative icons hidden","1.1.1","A","P0",iconExp===0||iconHid>=iconExp,Math.max(0,iconExp-iconHid),["exposed bi icons approx="+(iconExp-iconHid)],"Add aria-hidden=true to decorative i.");
var inputs=doc?doc.querySelectorAll("input,textarea,select"):[];var badLab=0,evLab=[];
Array.prototype.forEach.call(inputs,function(el){if(el.type==="hidden"||el.type==="checkbox"||el.type==="radio")return;var lab=el.id&&doc.querySelector('label[for="'+el.id+'"]');if(!lab&&!el.getAttribute("aria-label")&&!el.getAttribute("aria-labelledby")){badLab++;if(evLab.length<6)evLab.push(esc(fmt(el)));}});
push("labels","Inputs have labels","3.3.2","A","P0",badLab===0,badLab,evLab,"Use label for=ID. Never placeholder alone.");
var ce=doc?doc.querySelectorAll('[contenteditable="true"]'):[];var badCe=0;Array.prototype.forEach.call(ce,function(d){if(d.getAttribute("role")!=="textbox")badCe++;});
push("editor-role","Editable region has role","4.1.2","A","P0",badCe===0,badCe,[],"Add role=textbox aria-multiline aria-label.");
var divBtn=(html.match(/<div[^>]*(cursor:\s*pointer|onclick=)[^>]*>/gi)||[]).length;
push("div-button","No div-as-button","2.1.1","A","P0",divBtn===0,divBtn,findAll(/<div[^>]*(cursor:\s*pointer|onclick=)[^>]*>/gi,html),"Use real button.");
var tables=doc?doc.querySelectorAll("table"):[];var badTh=0,badCap=0;
Array.prototype.forEach.call(tables,function(t){if(t.querySelectorAll("th").length){if(!t.querySelector("th[scope]"))badTh++;if(!t.querySelector("caption"))badCap++;}});
push("th-scope","Table headers use scope","1.3.1","A","P0",badTh===0,badTh,[],"Use th scope=col/row.");
push("caption","Tables have caption","1.3.1","A","P1",badCap===0,badCap,[],"Add caption.");
var dupClose=(html.match(/aria-label="Close"/g)||[]).length;
push("close-label","Close names unique","2.4.6","AA","P1",dupClose<=1,dupClose,[],"Use Close X dialog.");
var hasCur=doc?doc.querySelectorAll("[aria-current]").length:0;
push("aria-current","Current nav exposed","2.4.8","AA","P1",hasCur>0,hasCur?0:1,[],"Set aria-current=page.");
var blank=(html.match(/target="_blank"/gi)||[]).length;
push("new-tab","New-tab links warn","3.2.5","AAA","P2",blank===0,blank,findAll(/<a[^>]*target="_blank"[^>]*>/gi,html),"Add opens in new tab text.");
var generic=0,evGen=[];if(doc){Array.prototype.forEach.call(doc.querySelectorAll("a"),function(a){var t=(a.textContent||"").trim().toLowerCase();if(/^(click here|learn more|read more|more|here)$/.test(t)){generic++;if(evGen.length<6)evGen.push(esc(fmt(a)));}});}
push("link-purpose","Link purpose AAA","2.4.9","AAA","P2",generic===0,generic,evGen,"Include destination in link text.");
push("contrast","Contrast 7 to 1, manual check (AAA)","1.4.6","AAA","P1",false,1,["Small and muted text found"],"Measure all text with a meter. Body text needs 7 to 1. Use Appearance switcher for high contrast.");
push("focus-seen","Visible focus indicator","2.4.7","AA","P0",/:focus-visible/i.test(html),/:focus-visible/i.test(html)?0:1,[],"Add :focus-visible 3 pixel outline, offset 3 pixel.");
push("target-size","Target 24px, AAA 44px","2.5.5","AAA","P1",false,1,["Check small buttons"],"AAA: every control at least 44 by 44 pixels with 8 pixel gaps.");
push("motion","Reduced motion honored","2.3.3","AAA","P2",/prefers-reduced-motion/i.test(html),/prefers-reduced-motion/i.test(html)?0:1,[],"Add media query to stop animation.");
var abbrs=doc?doc.querySelectorAll("abbr"):[];var badAb=0;Array.prototype.forEach.call(abbrs,function(a){if(!a.title&&!a.textContent)badAb++;});
var jar=["Slug","WYSIWYG","Gutter","CFWheels","DataTables"];var jarHit=jar.filter(function(w){return html.indexOf(w)>-1;});
push("abbr","Hard words explained (AAA)","3.1.3","AAA","P2",badAb===0&&jarHit.length===0,badAb+jarHit.length,jarHit.length?["Jargon: "+jarHit.join(", ")]:[],"Define once with abbr title or dfn, add glossary and plain help.");
push("read-level","Reading level plain language (AAA)","3.1.5","AAA","P2",false,1,["Manual"],"Rewrite help to grade 9 or lower. Provide glossary plus examples.");
push("help-avail","Help is available (AAA)","3.3.5","AAA","P2",/glossary|get help|help with/i.test(html),/glossary|get help|help with/i.test(html)?0:1,[],"Add context help and glossary links on every form.");
push("no-timing","No time limits (AAA)","2.2.3","AAA","P2",!/setTimeout|setInterval|meta[^>]*refresh/i.test(html)||/No time limits/i.test(html),1,["Manual"],"State no time limits. Remove timeouts or add off switch plus warning.");
var linkEls=doc?doc.querySelectorAll("a[href]"):[];var badLnk=0,evLnk=[];
Array.prototype.forEach.call(linkEls,function(a){var n=(a.getAttribute("aria-label")||a.getAttribute("title")||a.textContent||"").trim();if(!n){var im=a.querySelector("img[alt]");if(im)n=(im.getAttribute("alt")||"").trim();}if(!n){badLnk++;if(evLnk.length<6)evLnk.push(esc(fmt(a)));}});
push("link-name","Links have names","4.1.2","A","P0",badLnk===0,badLnk,evLnk,"Give every link visible text or aria-label.");
var tabEls=doc?doc.querySelectorAll("[tabindex]"):[];var badTab=0,evTab=[];
Array.prototype.forEach.call(tabEls,function(el){var t=parseInt(el.getAttribute("tabindex"),10);if(t>0){badTab++;if(evTab.length<6)evTab.push(esc(fmt(el)));}});
push("tabindex","No positive tabindex","2.4.3","A","P1",badTab===0,badTab,evTab,"Use tabindex 0 or -1 only, keep source order.");
var metaRef=(html.match(/<meta[^>]*http-equiv=["']?refresh/gi)||[]).length;
push("meta-refresh","No automatic refresh","2.2.1","A","P1",metaRef===0,metaRef,findAll(/<meta[^>]*http-equiv=["']?refresh[^>]*>/gi,html),"Remove meta refresh. Let users control timing.");
var frameEls=doc?doc.querySelectorAll("iframe,frame"):[];var badFrm=0,evFrm=[];
Array.prototype.forEach.call(frameEls,function(f){if(!(f.getAttribute("title")||"").trim()){badFrm++;if(evFrm.length<6)evFrm.push(esc(fmt(f)));}});
push("iframe-title","Frames have titles","4.1.2","A","P1",badFrm===0,badFrm,evFrm,"Add a short title to each iframe.");
var svgEls=doc?doc.querySelectorAll("svg"):[];var badSvg=0,evSvg=[];
Array.prototype.forEach.call(svgEls,function(s){var hid=s.getAttribute("aria-hidden")==="true";var nm=s.getAttribute("aria-label")||s.getAttribute("aria-labelledby")||s.querySelector("title");if(!hid&&!nm){badSvg++;if(evSvg.length<6)evSvg.push(esc(fmt(s)));}});
push("svg-name","SVG named or hidden","1.1.1","A","P1",badSvg===0,badSvg,evSvg,"Add aria-label plus title, or aria-hidden true if decorative.");
var headEls=doc?doc.querySelectorAll("h1,h2,h3,h4,h5,h6"):[];var badEmp=0,evEmp=[];
Array.prototype.forEach.call(headEls,function(h){if(!(h.textContent||"").trim()&&!h.getAttribute("aria-label")){badEmp++;if(evEmp.length<6)evEmp.push(esc(fmt(h)));}});
push("empty-heading","Headings have text","1.3.1","A","P1",badEmp===0,badEmp,evEmp,"Give every heading visible or labelled text.");
var idEls=doc?Array.prototype.map.call(doc.querySelectorAll("[id]"),function(e){return e.id;}):[];var seenId={},dupIds=[];idEls.forEach(function(v){if(seenId[v]){if(dupIds.indexOf(v)<0)dupIds.push(v);}else{seenId[v]=1;}});
push("dup-id","Ids are unique","1.3.1","A","P2",dupIds.length===0,dupIds.length,dupIds.slice(0,8),"Make every id unique. Labels and aria-labelledby depend on it.");
var metas=doc?doc.querySelectorAll('meta[name="viewport"]'):[];var badZ=0,evZ=[];
Array.prototype.forEach.call(metas,function(m){var c=(m.getAttribute("content")||"").toLowerCase();if(c.indexOf("user-scalable=no")>-1||c.indexOf("maximum-scale=1")>-1||c.indexOf("maximum-scale=0")>-1){badZ++;if(evZ.length<6)evZ.push(esc(fmt(m)));}});
push("viewport-zoom","Zoom not disabled","1.4.4","AA","P1",badZ===0,badZ,evZ,"Remove user-scalable=no and maximum-scale=1 from viewport meta.");
var mbEls=doc?doc.querySelectorAll("marquee,blink"):[];var badMb=0,evMb=[];
Array.prototype.forEach.call(mbEls,function(el){badMb++;if(evMb.length<6)evMb.push(esc(fmt(el)));});
push("marquee-blink","No marquee or blink","2.2.2","A","P1",badMb===0,badMb,evMb,"Remove marquee and blink elements.");
var fsEls=doc?doc.querySelectorAll("fieldset"):[];var badFs=0,evFs=[];
Array.prototype.forEach.call(fsEls,function(el){if(!el.querySelector("legend")||!(el.querySelector("legend").textContent||"").trim()){badFs++;if(evFs.length<6)evFs.push(esc(fmt(el)));}});
push("fieldset-legend","Fieldsets have legends","1.3.1","A","P1",badFs===0,badFs,evFs,"Add a non-empty legend to every fieldset.");
var mainCnt=doc?doc.querySelectorAll("main,[role=main]").length:(html.match(/<main[\s>]/gi)||[]).length;
push("landmark","One main landmark","1.3.1","A","P2",mainCnt===1,mainCnt,["main landmarks="+mainCnt],"Wrap main content in one main element.");
var fldEls=doc?doc.querySelectorAll("input,select,textarea"):[];var badFld=0,evFld=[];
Array.prototype.forEach.call(fldEls,function(el){var ty=(el.getAttribute("type")||"").toLowerCase();if(ty==="hidden"||ty==="submit"||ty==="button"||ty==="reset"||ty==="image")return;var okName=el.getAttribute("aria-label")||el.getAttribute("aria-labelledby")||(el.id&&doc.querySelector('label[for="'+el.id+'"]'))||el.closest("label");if(!okName){badFld++;if(evFld.length<6)evFld.push(esc(fmt(el)));}});
push("label","Form controls have labels","3.3.2","A","P0",badFld===0,badFld,evFld,"Add a label for each control, or aria-label when no visible label exists.");
var liEls=doc?doc.querySelectorAll("li"):[];var badLi=0,evLi=[];
Array.prototype.forEach.call(liEls,function(el){var p=el.parentElement;if(!p||(p.nodeName!=="UL"&&p.nodeName!=="OL")){badLi++;if(evLi.length<6)evLi.push(esc(fmt(el)));}});
push("list-structure","List items are in lists","1.3.1","A","P2",badLi===0,badLi,evLi,"Put every li inside a ul or ol.");
var okRoles="alert,alertdialog,application,article,banner,button,cell,checkbox,columnheader,combobox,complementary,contentinfo,definition,dialog,directory,document,feed,figure,form,grid,gridcell,group,heading,img,link,list,listbox,listitem,log,main,marquee,math,menu,menubar,menuitem,menuitemcheckbox,menuitemradio,navigation,none,note,option,presentation,progressbar,radio,radiogroup,region,row,rowgroup,rowheader,scrollbar,search,searchbox,separator,slider,spinbutton,status,switch,tab,table,tablist,tabpanel,term,textbox,timer,toolbar,tooltip,tree,treegrid,treeitem".split(",");
var roleEls=doc?doc.querySelectorAll("[role]"):[];var badRole=0,evRole=[];
Array.prototype.forEach.call(roleEls,function(el){var r=(el.getAttribute("role")||"").toLowerCase();var bad=r.split(/\s+/).some(function(t){return t&&okRoles.indexOf(t)<0;});if(bad){badRole++;if(evRole.length<6)evRole.push(esc(fmt(el)));}});
push("aria-role","Valid ARIA roles","4.1.2","A","P1",badRole===0,badRole,evRole,"Use role values from the WAI-ARIA list only.");
var medEls=doc?doc.querySelectorAll("audio[autoplay],video[autoplay]"):[];var badMed=0,evMed=[];
Array.prototype.forEach.call(medEls,function(el){if(el.getAttribute("muted")==null){badMed++;if(evMed.length<6)evMed.push(esc(fmt(el)));}});
push("media-autoplay","No autoplaying sound","1.4.2","A","P1",badMed===0,badMed,evMed,"Remove autoplay, or start muted with a visible play control.");
var inpAll=doc?doc.querySelectorAll("input"):[];var badAc=0,evAc=[];
Array.prototype.forEach.call(inpAll,function(el){var ty=(el.getAttribute("type")||"").toLowerCase();if(ty!=="email"&&ty!=="tel")return;if(el.hasAttribute("autocomplete"))return;badAc++;if(evAc.length<6)evAc.push(esc(fmt(el)));});
push("autocomplete","Input purpose identified","1.3.5","AA","P2",badAc===0,badAc,evAc,"Add autocomplete=email or autocomplete=tel to common fields.");
var vidEls=doc?doc.querySelectorAll("video"):[];var badVid=0,evVid=[];
Array.prototype.forEach.call(vidEls,function(v){if(!v.querySelector("track[kind=captions]")){badVid++;if(evVid.length<6)evVid.push(esc(fmt(v)));}});
push("video-captions","Videos have captions","1.2.2","A","P1",badVid===0,badVid,evVid,"Add a track kind=captions for spoken content.");
var ahEls=doc?doc.querySelectorAll('[aria-hidden="true"]'):[];var badAh=0,evAh=[];
Array.prototype.forEach.call(ahEls,function(el){var f=el.querySelectorAll("a[href],button,input,select,textarea,[tabindex]");var vis=Array.prototype.filter.call(f,function(c){return !c.closest("[hidden],.d-none,.modal:not(.show),.offcanvas:not(.show),.collapse:not(.show)");});if(vis.length){badAh+=vis.length;if(evAh.length<6)evAh.push(esc(fmt(vis[0])));}});
push("aria-hidden-focus","No focusable content in aria-hidden","1.3.1","A","P1",badAh===0,badAh,evAh,"Remove aria-hidden from containers with focusable controls, or move the controls out.");

  if (typeof axe === 'undefined') {
    resolve(F);
    return;
  }








  // Wait a moment for DOM to settle, then run axe
  setTimeout(function() {
    axe.run(doc || document.createElement('div'), {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'] }
    }).then(function(results) {
      results.violations.forEach(function(v) {
        // Map Axe violation to our format
        var id = "axe-" + v.id;
        var title = "[Axe] " + v.help;
        var ev = [];
        var count = v.nodes.length;
        var sev = (v.impact === "critical" || v.impact === "serious") ? "P0" : "P1";

        v.nodes.forEach(function(node) {
          if (ev.length < 6) {
            ev.push(node.failureSummary + "\nTarget: " + node.target.join(","));
          }
        });

        push(id, title, "Axe", "A", sev, false, count, ev, v.description + " (" + v.helpUrl + ")");
      });

      resolve(F);
    }).catch(function(err) {
      console.error(err);

      resolve(F);
    });
  }, 100);
}); }

function render(F){
var list=F.filter(function(f){return passLvl(f)&&passSev(f);});
var showP=$("chkPassed").checked;
var fails=list.filter(function(f){return !f.ok;});
var passes=list.filter(function(f){return f.ok;});
var p0=fails.filter(function(f){return f.sev==="P0";}).length;
var cards=[["Checks",list.length,"text-bg-dark"],["Failed",fails.length,fails?"text-bg-danger":"text-bg-success"],["P0 blockers",p0,p0?"text-bg-danger":"text-bg-success"],["Passed",passes.length,"text-bg-success"]];
$("summaryCards").innerHTML=cards.map(function(c){return '<div class="col-6 col-md-3"><div class="card"><div class="card-body py-2"><div class="small text-secondary">'+c[0]+'</div><div class="fs-4 fw-bold">'+c[1]+' <span class="badge '+c[2]+'">'+(c[0]==="Failed"?(fails?"FAIL":"PASS"):c[0]==="P0 blockers"?(p0?"FAIL":"PASS"):"")+'</span></div></div></div></div>';}).join("");
var rows=(showP?list:fails).map(function(f){return "<tr><td><strong>"+esc(f.title)+"</strong><br><span class=text-secondary>"+f.id+"</span></td><td><code>"+f.sc+"</code></td><td><span class='badge "+(f.level==="A"?"text-bg-dark":f.level==="AA"?"text-bg-primary":"text-bg-info")+"'>"+f.level+"</span></td><td>"+f.sev+"</td><td>"+(f.ok?'<span class="badge text-bg-success">PASS</span>':'<span class="badge text-bg-danger">FAIL</span>')+"</td><td>"+f.count+"</td></tr>";}).join("");
$("resBody").innerHTML=rows||'<tr><td colspan="6">No rows for current filters.</td></tr>';
var det=fails.map(function(f){return "<details><summary><span class='badge text-bg-danger'>FAIL</span> "+esc(f.title)+" <code>"+f.sc+"</code> <span class='badge text-bg-secondary'>"+f.level+"</span> <span class='badge text-bg-dark'>"+f.sev+"</span></summary><p class=mb-1><strong>Fix:</strong> "+esc(f.fix)+"</p>"+(f.ev.length?"<div class=evidence>"+f.ev.map(esc).join("\n")+"</div>":"")+"</details>";}).join("");
$("detailList").innerHTML=det||"<p>No failures for current filters.</p>";
var L="ADA Auditor report â€” "+new Date().toISOString()+"\nChecks: "+list.length+" Failed: "+fails.length+" P0: "+p0+"\n\nTool: https://indigenousj.github.io/ADA/\n\n";
fails.forEach(function(f){L+="FAIL ["+f.level+"/"+f.sev+"] "+f.title+" (WCAG "+f.sc+") count="+f.count+"\n Fix: "+f.fix+"\n "+(f.ev.slice(0,4).join(" | ")||"")+"\n\n";});
lastReport=L;
$("btnCopy").disabled=!fails.length;$("btnDownload").disabled=!fails.length;
say("Audit complete. "+fails.length+" failures, "+p0+" P0 blockers. "+(fails.length?"FAIL.":"PASS."));
$("btnApply").disabled=true;setStep(2);
var h=$("hRes");h.focus();}
function askConfirm(title,text,yesLabel,onYes){
$("confirmTitle").textContent=title;$("confirmText").textContent=text;
$("btnConfirmYes").textContent=yesLabel;
var modalEl=$("confirmModal");var m=window.bootstrap?bootstrap.Modal.getOrCreateInstance(modalEl):null;
var yes=$("btnConfirmYes");var handler=function(){if(m)m.hide();yes.removeEventListener("click",handler);onYes();$("btnConfirmNo").focus();};
yes.addEventListener("click",handler);
if(m){m.show();var f=$("btnConfirmNo");if(f)f.focus();}else{onYes();}
}
function currentHTML(){return $("htmlInput").value;}
$("btnRun").addEventListener("click",function(){
clearErr();
if(activeTab()==="url"){var u=$("urlInput").value.trim();if(!u){showErr("Enter a URL or switch to Paste HTML.");return;}
if(!/^https?:\/\//i.test(u))u="https://"+u;$("urlInput").value=u;
var uok=true;try{new URL(u);}catch(e){uok=false;}if(!uok){showErr("That does not look like a web address. Example: https://example.com/page");return;}
say("Fetching "+u+" ...");
fetch(u,{mode:"cors"}).then(function(r){
if(r.status===404)throw new Error("page not found (404). Check the address for typos. If this is your own GitHub Pages site, it may still be building - try again in a minute.");
if(r.status===403)throw new Error("forbidden (403). The page may need a login.");
if(r.status>=500)throw new Error("server error ("+r.status+"). Try again later.");
if(!r.ok)throw new Error("HTTP "+r.status+".");
return r.text();}).then(function(t){$("htmlInput").value=t;setTab("html");say("Fetched "+Math.round(t.length/1024)+" KB.");audit(t).then(render);}).catch(function(e){var m=String(e&&e.message||e);
if(m.indexOf("Failed to fetch")>-1||m.indexOf("NetworkError")>-1){showErr("Fetch blocked by CORS or network ("+u+"). View Source (Ctrl+U), copy, and use Paste HTML.");say("Fetch blocked.");}
else{showErr("Fetch failed: "+m+" Tip: View Source (Ctrl+U), copy, and use Paste HTML.");say("Fetch failed.");}});
return;}
var h=currentHTML();if(!h.trim()){showErr("Paste HTML first.");return;}
audit(h).then(render);});
$("btnClear").addEventListener("click",function(){
var doClear=function(){var saved=$("htmlInput").value;$("htmlInput").value="";$("urlInput").value="";$("resBody").innerHTML='<tr><td colspan="6" class=text-secondary>No audit yet.</td></tr>';$("detailList").innerHTML="";$("summaryCards").innerHTML="";lastReport="";$("btnCopy").disabled=true;$("btnDownload").disabled=true;$("btnApply").disabled=true;clearErr();setStep(1);say("Cleared. Your last input is saved for Undo.");var u=document.createElement("button");u.type="button";u.className="btn btn-warning mt-2";u.textContent="Undo clear (restore input)";u.addEventListener("click",function(){$("htmlInput").value=saved;u.remove();say("Input restored.");$("htmlInput").focus();});$("fetchStatus").appendChild(u);$("htmlInput").focus();};
askConfirm("Clear all input and results?","This removes your pasted HTML, URL, and results. You can undo right after.","Yes, clear all",doClear);});
$("btnCopy").addEventListener("click",function(){if(navigator.clipboard){navigator.clipboard.writeText(lastReport).then(function(){say("Report copied.");});}else{say("Clipboard unavailable.");}});
$("btnDownload").addEventListener("click",function(){var b=new Blob([lastReport],{type:"text/markdown"});var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="ada-audit-report.md";a.click();say("Report downloaded.");});
var shareBtn=$("btnShareCopy");if(shareBtn){shareBtn.addEventListener("click",function(){var link="https://indigenousj.github.io/ADA/";if(navigator.clipboard){navigator.clipboard.writeText(link).then(function(){say("Link copied. Paste it anywhere to share.");});}else{say("Copy this link: "+link);}});}
document.querySelectorAll('input[name=level],input[name=sev]').forEach(function(r){r.addEventListener("change",markDirty);});
$("chkPassed").addEventListener("change",markDirty);
$("btnApply").addEventListener("click",function(){if($("htmlInput").value)audit($("htmlInput").value).then(render);});
})();
