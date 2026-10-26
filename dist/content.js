// Fill one src at a time with a local image or video in /assets/.
// type: 'image' | 'video'. A null src preserves the designed media area.
export const media = {
  schoolai: {src:null,type:'image',alt:'SchoolAI project preview'},
  glasspos: {src:null,type:'image',alt:'GlassPos project preview'},
  miawpos: {src:null,type:'image',alt:'MiawPOS project preview'},
  portfolio: {src:null,type:'image',alt:'Systems in Motion project preview'}
};

// Optional background track, for example {src:'/assets/studio.mp3',title:'Studio mix'}.
// Without a file the play button starts an original generative ambient score.
export const audioTrack = null;

export const projects = {
  schoolai:{index:'01',name:'SchoolAI',category:'EDUCATION / MULTILINGUAL WEB',subtitle:'One school. Many ways to connect.',summary:'A maintained school platform that brings a multilingual public experience, editorial workflows, admissions content, media, and role-specific portals into one connected product.',details:['Indonesian, English, and Arabic experiences with RTL-aware presentation.','An operational CMS and separate administrator, teacher, and student boundaries.','Security, accessibility, media lifecycle, and deployment treated as application behavior.'],source:'https://github.com/Asyraf2003/schoolai',live:'https://almustaqbal.sch.id',status:'PUBLIC WEB PLATFORM / LARAVEL & PHP',poster:'Room to\nconnect.'},
  glasspos:{index:'02',name:'GlassPos',category:'TRANSACTIONS / OPERATIONAL SYSTEMS',subtitle:'When money moves, the system agrees.',summary:'Workshop point-of-sale and operations software built around the lifecycle of a transaction. Payments, stock, corrections, refunds, procurement, and reporting need to stay explainable together.',details:['Ports and adapters separate business rules from delivery and infrastructure.','Payment allocation, stock reversal, and historical meaning are explicit boundaries.','Regression checks focus on retries, stale state, financial limits, and consistency.'],source:'https://github.com/Asyraf2003/GlassPos',status:'WORKSHOP OPERATIONS / LARAVEL & MYSQL',poster:'Everything.\nIn balance.'},
  miawpos:{index:'03',name:'MiawPOS',category:'GO / A FINANCIAL FOUNDATION',subtitle:'Small footprint. Exact intentions.',summary:'An open-source, self-host-first POS foundation written in Go with Echo. A narrow working chain connects catalog, cash sale, exact financial calculation, persistence, audit history, and readback.',details:['PostgreSQL is the primary server persistence target.','SQLite portability is proven only for the documented catalog/pricing slice.','The browser client connects the locally proven business chain; broader release evidence is still in progress.'],source:'https://github.com/Asyraf2003/meawpos-api',live:'https://github.com/Asyraf2003/miawpos-ui',liveLabel:'Explore the browser client ↗',status:'IN DEVELOPMENT / GO, ECHO & POSTGRESQL',poster:'Every cent.\nAccounted.'},
  portfolio:{index:'04',name:'Systems in Motion',category:'PERSONAL / AN ONGOING EXPERIMENT',subtitle:'A little bit of code. A lot of curiosity.',summary:'This space connects systems engineering with a more expressive surface. A structural monogram, editorial project stories, and an explorable workspace introduce the person behind the repositories.',details:['Native HTML, CSS, JavaScript, WebGL, and the Web Animations API.','Original procedural geometry with a software 3D fallback.','Optional ambient audio, keyboard navigation, and motion preferences built into the experience.'],source:'https://github.com/Asyraf2003/asyrafcloud-web',status:'THE SITE YOU ARE EXPLORING / AN ORIGINAL IMPLEMENTATION',poster:'Think it through.\nMake it move.'}
};
