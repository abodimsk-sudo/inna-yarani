export async function onRequestPost({env}) {
 if(!env.DB)return Response.json({error:"Database not configured"},{status:503});
 const id=crypto.randomUUID();
 await env.DB.prepare("INSERT INTO visits(id) VALUES(?)").bind(id).run();
 return Response.json({id},{headers:{"Cache-Control":"no-store"}});
}