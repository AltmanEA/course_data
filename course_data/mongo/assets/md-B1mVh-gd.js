import{b as d,o as r,w as o,g as e,v as m,x as c,T as t}from"./modules/vue-Djjs8ib7.js";import{I as i}from"./slidev/default-B8dL6EFq.js";import{u as l,f as u}from"./slidev/context-DvXCExII.js";import"./index-D1ztI7Wk.js";import"./modules/shiki-5xwVHN4U.js";const C={__name:"slides.md__slidev_14",setup(f){const{$clicksContext:s,$frontmatter:a}=l();return s.setup(),(p,n)=>(r(),d(i,m(c(t(u)(t(a),13))),{default:o(()=>[...n[0]||(n[0]=[e("h1",null,"Команды mongo",-1),e("div",{class:"grid grid-cols-2 gap-4"},[e("div",{class:"flex justify-center",style:{"font-size":"small"}},[e("pre",null,[e("code",null,`CommandStartedEvent {
  name: 'commandStarted',
  address: '127.0.0.1:27017',
  connectionId: 1,
  serviceId: undefined,
  requestId: 5,
  databaseName: 'test',
  commandName: 'insert',
  command: {
    insert: 'students',
    documents: [ [Student] ],
    ordered: true,
    lsid: { id: Binary.createFromBase64('...', 4) },
    '$db': 'test'
  },
  serverConnectionId: 30n
}`)])]),e("div",{class:"flex justify-center",style:{"font-size":"small"}},[e("pre",null,[e("code",null,` CommandSucceededEvent {
  name: 'commandSucceeded',
  address: '127.0.0.1:27017',
  connectionId: 1,
  serviceId: undefined,
  requestId: 5,
  commandName: 'insert',
  duration: 32,
  reply: { n: 1, ok: 1 },
  serverConnectionId: 30n,
  databaseName: 'test'
}`)])])],-1)])]),_:1},16))}};export{C as default};
