'use strict';
const $=s=>document.querySelector(s);let toastTimer;
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
document.querySelectorAll('.fact').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('flipped');b.setAttribute('aria-expanded',b.classList.contains('flipped'))}));
let audio;const voices=new Set();
function getAudio(){audio??=new (window.AudioContext||window.webkitAudioContext)();return audio}
function pianoTone(f,when,duration=.8,volume=.15){const ctx=getAudio();const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(volume,when+.008);gain.gain.exponentialRampToValueAtTime(volume*.25,when+.18);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);gain.connect(ctx.destination);
 [1,2,3].forEach((harmonic,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f*harmonic;g.gain.value=[1,.24,.07][i];o.connect(g);g.connect(gain);o.start(when);o.stop(when+duration+.02);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();g.disconnect()}})
}
const keys=[...document.querySelectorAll('[data-note]')];
keys.forEach(k=>k.addEventListener('click',async()=>{try{const ctx=getAudio();await ctx.resume();pianoTone(Number(k.dataset.note),ctx.currentTime);k.classList.add('active');setTimeout(()=>k.classList.remove('active'),220)}catch(e){toast('Səs açıla bilmədi. Yenidən toxun.')}}));
let songPlaying=false,songStarting=false,songTimers=[];
function stopSong(){songTimers.forEach(clearTimeout);songTimers=[];voices.forEach(o=>{try{o.stop()}catch(e){}});keys.forEach(k=>k.classList.remove('active'));songPlaying=false;$('#melody').textContent='♫ Lovers Rock çal';$('#pianoStatus').textContent='Lovers Rock · qısa piano aranjimanı.';$('#melody').setAttribute('aria-pressed','false')}
// Short melodic phrase, adapted from Piano Letter Notes' Lovers Rock transcription.
// Uppercase D/A indicate D-sharp/A-sharp; lowercase letters are natural notes.
const phrase=['g-g-g-f---D----------------','----------------------g-g-','g-A---g-------g-g-g-g-gg--','f-------------f-f-f-g-f-D-'];
const pitch={g:79,f:77,D:75,A:82};const tick=60/105/4;
$('#melody').addEventListener('click',async()=>{if(songStarting)return;if(songPlaying){stopSong();return}songStarting=true;try{const ctx=getAudio();await ctx.resume();songPlaying=true;$('#melody').textContent='■ Dayandır';$('#melody').setAttribute('aria-pressed','true');$('#pianoStatus').textContent='Lovers Rock pianoda səslənir ♫';const start=ctx.currentTime+.06;
 const melody=phrase.join('');
 for(let i=0;i<melody.length;i++){const n=pitch[melody[i]];if(!n)continue;let next=i+1;while(next<melody.length&&!pitch[melody[next]])next++;pianoTone(440*2**((n-69)/12),start+i*tick,Math.min(1.2,Math.max(.18,(next-i)*tick*.9)),.13);const key=keys.find(k=>Number(k.dataset.midi)===n-12);if(key){songTimers.push(setTimeout(()=>key.classList.add('active'),60+i*tick*1000));songTimers.push(setTimeout(()=>key.classList.remove('active'),60+i*tick*1000+130))}}
 // Soft accompaniment beneath the melodic phrase.
 const chords=[[51,55,58],[51,55,58],[53,56,60],[53,56,60]];
 chords.forEach((chord,bar)=>{for(let beat=0;beat<4;beat++){const time=start+(bar*26+beat*6)*tick;chord.forEach((n,j)=>pianoTone(440*2**((n-69)/12),time+j*.025,.9,.035))}});
 songTimers.push(setTimeout(stopSong,melody.length*tick*1000+1300));
}catch(e){stopSong();toast('Səs açıla bilmədi. Düyməyə yenidən toxun.')}finally{songStarting=false}});
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



