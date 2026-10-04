'use strict';
const $=s=>document.querySelector(s);let toastTimer;
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
document.querySelectorAll('.fact').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('flipped');b.setAttribute('aria-expanded',b.classList.contains('flipped'))}));
let audio;const voices=new Set(),pianoBuffers=new Map();let samplesPromise;
function getAudio(){audio??=new (window.AudioContext||window.webkitAudioContext)();return audio}
async function loadPiano(){if(pianoBuffers.size)return;if(!samplesPromise)samplesPromise=(async()=>{const ctx=getAudio();await Promise.all(Object.entries(window.ALI_PIANO_SAMPLES).map(async([n,uri])=>{const bytes=Uint8Array.from(atob(uri.split(',')[1]),c=>c.charCodeAt(0));pianoBuffers.set(Number(n),await ctx.decodeAudioData(bytes.buffer))}))})().catch(e=>{samplesPromise=null;throw e});return samplesPromise}
function pianoTone(n,when,duration=.8,volume=.6){const ctx=getAudio();const anchor=[...pianoBuffers.keys()].reduce((a,b)=>Math.abs(b-n)<Math.abs(a-n)?b:a);const source=ctx.createBufferSource();source.buffer=pianoBuffers.get(anchor);source.playbackRate.value=2**((n-anchor)/12);const gain=ctx.createGain();gain.gain.setValueAtTime(volume,when);gain.gain.setTargetAtTime(.0001,when+Math.max(.08,duration),.12);source.connect(gain);gain.connect(ctx.destination);source.start(when);source.stop(when+duration+.8);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect()}}
const keys=[...document.querySelectorAll('[data-note]')];
function lightKey(n,delay,duration){const key=keys.find(k=>Number(k.dataset.midi)%12===n%12);if(!key)return;songTimers.push(setTimeout(()=>{key.classList.add('active');songTimers.push(setTimeout(()=>key.classList.remove('active'),Math.max(120,duration*1000)))},Math.max(0,delay)))}
keys.forEach(k=>k.addEventListener('click',async()=>{try{const ctx=getAudio();await ctx.resume();await loadPiano();pianoTone(Number(k.dataset.midi),ctx.currentTime,.55,.65);k.classList.add('active');setTimeout(()=>k.classList.remove('active'),220)}catch(e){toast('Piano səsi açıla bilmədi. Yenidən toxun.')}}));
let songPlaying=false,songStarting=false,songTimers=[],scheduler,animation,playbackStart=0,nextEvent=0;
function stopSong(finished=false){clearInterval(scheduler);cancelAnimationFrame(animation);songTimers.forEach(clearTimeout);songTimers=[];voices.forEach(o=>{try{o.stop()}catch(e){}});keys.forEach(k=>k.classList.remove('active'));songPlaying=false;$('#melody').textContent='♫ Valse çal';$('#melody').setAttribute('aria-pressed','false');$('#songProgress').style.width=finished?'100%':'0%';$('#pianoStatus').textContent=finished?'Valse bitdi ♡ İstəsən yenidən dinlə.':'Evgeny Grinko — Valse · Sevdiyim piano parçalarından biri.'}
$('#melody').addEventListener('click',async()=>{if(songStarting)return;if(songPlaying){stopSong();return}songStarting=true;$('#melody').textContent='Piano hazırlanır…';try{const ctx=getAudio();await ctx.resume();await loadPiano();if(document.hidden){stopSong();return}songPlaying=true;nextEvent=0;playbackStart=ctx.currentTime+.1;const score=window.ALI_VALSE,beat=60/score.bpm,total=score.beats*beat;$('#melody').textContent='■ Dayandır';$('#melody').setAttribute('aria-pressed','true');
 function schedule(){while(nextEvent<score.events.length){const [t,n,d,v]=score.events[nextEvent],at=playbackStart+t*beat;if(at>ctx.currentTime+.3)break;pianoTone(n,at,d*beat*.95,v);lightKey(n,(at-ctx.currentTime)*1000,Math.min(d*beat,.5));nextEvent++}}
 schedule();scheduler=setInterval(schedule,80);
 function progress(){if(!songPlaying)return;const elapsed=Math.max(0,ctx.currentTime-playbackStart);$('#songProgress').style.width=Math.min(100,elapsed/total*100)+'%';const fmt=x=>Math.floor(x/60)+':'+String(Math.floor(x%60)).padStart(2,'0');$('#pianoStatus').textContent='Valse · '+fmt(elapsed)+' / '+fmt(total)+' · Sevdiyim piano parçalarından biri';if(elapsed>=total+.8){stopSong(true);return}animation=requestAnimationFrame(progress)}progress();
}catch(e){stopSong();toast('Piano səsi açıla bilmədi. Yenidən cəhd et.')}finally{songStarting=false}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&songPlaying)stopSong()});
$('#giveFlowers').addEventListener('click',()=>{$('#bouquet').classList.add('open');$('#giveFlowers').setAttribute('aria-expanded','true');$('#giveFlowers').textContent='Buket artıq sənindir ♡';$('#flowerNote').textContent='Al, bu çiçəklər sənə. Ümid edirəm üzünü güldürdü ♡';burst()});

function burst(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<28;i++){const el=document.createElement('i');el.className='confetti';el.style.cssText=`left:50%;top:55%;background:${['#ff8db8','#ffe58b','#b8a0e8'][i%3]};--dx:${Math.random()*500-250}px;--dy:${Math.random()*500-100}px;`;document.body.append(el);setTimeout(()=>el.remove(),1600)}}
$('#gift').addEventListener('click',()=>{const open=$('#letter').hidden;$('#letter').hidden=!open;$('#gift').setAttribute('aria-expanded',open);if(open)burst()});
const questions=[{q:'Bu balaca dünya diqqətini çəkdi?',a:['Hə, çox şirindir ♡','Bir az maraqlı gəldi','Hələ baxıram']},{q:'Məndə ən çox nə maraqlı gəldi?',a:['Piano çalmağın ♫','Yemək bişirməyin','IT ilə məşğul olmağın','Hamısından bir az']},{q:'İlk söhbət nədən başlasın?',a:['Musiqidən','Sevdiyimiz yeməklərdən','Gündəlik həyatımızdan']},{q:'Mənimlə tanış olmaq istəyərsən?',a:['Hə, gəl tanış olaq ♡','Əvvəl bir az söhbət edək','Hələ yox']}];let idx=0,picks=[];
function render(){const q=questions[idx];$('#question').textContent=q.q;$('#step').textContent=`0${idx+1} / 04`;$('#progress').style.width=(idx+1)*25+'%';$('#answers').replaceChildren();q.a.forEach(t=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{picks.push(t);idx++;idx===questions.length?finish():render()};$('#answers').append(b)})}
function summary(){return 'Salam Əli! Saytındakı cavablarım:\n'+questions.map((q,i)=>q.q+' — '+picks[i]).join('\n')}
function finish(){$('#question').textContent=picks[3]==='Hələ yox'?'Səmimi cavabın üçün sağ ol ♡':'Onda bir “salam”la başlayaq ♡';$('#answers').replaceChildren();$('#progress').style.width='100%';const r=$('#result');r.hidden=false;r.replaceChildren();const p=document.createElement('p');p.textContent=picks[3]==='Hələ yox'?'Heç bir problem yoxdur. Ümid edirəm bu balaca dünya gününə bir az rəng qatdı.':'Cavablarını kopyalayıb Instagram-da mənə göndərə bilərsən. Söhbətin davamını birlikdə yazaq.';r.append(p);picks.forEach((t,i)=>{const line=document.createElement('p');line.textContent=`${i+1}. ${t}`;r.append(line)});const copy=document.createElement('button');copy.className='button';copy.textContent='Cavabları kopyala ↗';copy.onclick=async()=>{try{await navigator.clipboard.writeText(summary());toast('Kopyalandı! İstəsən mənə göndər ♡')}catch(e){const a=document.createElement('textarea');a.value=summary();r.append(a);a.select();toast('Mətni seçib kopyalaya bilərsən.')}};const retry=document.createElement('button');retry.className='button';retry.textContent='Yenidən ↶';retry.onclick=()=>{idx=0;picks=[];r.hidden=true;render()};r.append(copy,retry);if(picks[3]!=='Hələ yox')burst();setTimeout(()=>{$('#social').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});$('#socialHeading').focus({preventScroll:true})},1000)}
render();
for(const platform of ['instagram','tiktok']){const a=$('#'+platform);const username=(window.ALI_SOCIALS?.[platform]||'').trim().replace(/^@/,'');if(username){a.href=platform==='instagram'?`https://www.instagram.com/${encodeURIComponent(username)}/`:`https://www.tiktok.com/@${encodeURIComponent(username)}`;a.target='_blank';a.rel='noopener noreferrer'}else a.onclick=e=>{e.preventDefault();toast('Əli bu profilin linkini hələ əlavə etməyib ♡')}}
const messages=[
 'Miyav! Məncə Əli ilə bir salamlaşmağa dəyər ♡',
 'Piano çalır, yemək bişirir… Mən sadəcə qabımın dolmasını gözləyirəm.',
 'Bu qədər kod yazıb. Sən də bir “salam” yazsan, layihə tamamdır!',
 '2Pac, meyxana, piano… Bu playlistdə sənə də yer tapılar ♫',
 'Kartların arxasında bir az daha Əli var. Pəncəmlə yoxladım!',
 'İlk söhbət üçün sevdiyin mahnını soruş. Mənimki miyav remixidir.',
 'Məncə ən vacib sual: Əli nə bişirəcək, biz nə yeyəcəyik?',
 'Bu saytı sənin üçün hazırlayıb. Mən isə səhifəni nəzarətdə saxlayıram.',
 'Qərar sənindir. Mən sadəcə şirin görünməyə gəlmişəm ♡',
 'Çiçəkləri gördün? Buketi açmaq üçün düyməyə toxun ♡',
 'Bir düyməyə toxun, piano səslənsin. Mən qulaq asıram ♫',
 'Sən danış, Əli dinləsin. Mən də arada miyav deyərəm.'
];
const positions=['bottom-left','bottom-right','mid-left','mid-right','top-left','top-right'];
const cats=['assets/cat-peek.svg','assets/cat-sleep.svg','assets/cat-heart.svg'];
let lastMessage=-1,lastPosition=-1,lastCat=-1,closed=false,visitTimer,hideTimer;
const visitor=$('#visitor');
function differentIndex(length,last){let n;do{n=Math.floor(Math.random()*length)}while(length>1&&n===last);return n}
function scheduleVisit(delay){clearTimeout(visitTimer);if(!closed)visitTimer=setTimeout(visit,delay)}
function visit(){
 if(closed)return;
 if(document.hidden){scheduleVisit(3000);return}
 // Keep the quiz and social buttons clear while the visitor is interacting.
 if(document.activeElement?.closest('.quiz,.socials')){scheduleVisit(4000);return}
 lastMessage=differentIndex(messages.length,lastMessage);
 lastPosition=differentIndex(positions.length,lastPosition);
 lastCat=differentIndex(cats.length,lastCat);
 $('#visitorMessage').textContent=messages[lastMessage];
 $('#visitorCat').src=cats[lastCat];
 visitor.dataset.position=positions[lastPosition];
 visitor.classList.add('show');
 clearTimeout(hideTimer);
 hideTimer=setTimeout(()=>{visitor.classList.remove('show');scheduleVisit(11000+Math.random()*7000)},6500);
}
scheduleVisit(4500);
$('#dismiss').onclick=()=>{closed=true;clearTimeout(visitTimer);clearTimeout(hideTimer);visitor.classList.remove('show')};
if('IntersectionObserver'in window){const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.section-heading,.piano-card,.letter-art').forEach(e=>{e.classList.add('reveal');obs.observe(e)})}




