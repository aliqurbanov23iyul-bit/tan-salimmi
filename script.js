'use strict';
const $=s=>document.querySelector(s);let toastTimer;
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
document.querySelectorAll('.fact').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('flipped');b.setAttribute('aria-expanded',b.classList.contains('flipped'))}));
let audio;function note(f){try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,audio.currentTime);g.gain.linearRampToValueAtTime(.16,audio.currentTime+.015);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.8);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.85);return true}catch(e){toast('Bu brauzerdə səs açıla bilmədi.');return false}}
const keys=[...document.querySelectorAll('[data-note]')];function play(k){note(Number(k.dataset.note));k.classList.add('active');setTimeout(()=>k.classList.remove('active'),220)}keys.forEach(k=>k.addEventListener('click',()=>play(k)));$('#melody').addEventListener('click',()=>{const player=$('#loversPlayer');if(!player.firstChild){const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/mP8bpYjMUqk?autoplay=1';frame.title='TV Girl — Lovers Rock piano cover';frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;player.append(frame);const link=document.createElement('a');link.href='https://www.youtube.com/watch?v=mP8bpYjMUqk';link.textContent='Video açılmırsa, YouTube-da dinlə ↗';link.target='_blank';link.rel='noopener noreferrer';player.append(link)}player.hidden=false;$('#pianoStatus').textContent='Lovers Rock · piano cover. Lazım olsa videodakı Play düyməsinə bas.';player.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})});
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


