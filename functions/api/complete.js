export async function onRequestPost({request,env}) {
 if(!env.DB)return Response.json({error:"Database not configured"},{status:503});
 let body;try{body=await request.json()}catch{return Response.json({error:"Invalid request"},{status:400})}
 if(typeof body.id!=="string"||!(/^[0-9a-f-]{36}$/i).test(body.id)||!["completed","pledged"].includes(body.event))return Response.json({error:"Invalid request"},{status:400});
 const sql=body.event==="completed"?"UPDATE visits SET completed_at=COALESCE(completed_at,datetime('now')) WHERE id=?":"UPDATE visits SET pledged_at=COALESCE(pledged_at,datetime('now')) WHERE id=? AND completed_at IS NOT NULL";
 const result=await env.DB.prepare(sql).bind(body.id).run();
 return Response.json({ok:result.meta.changes>0},{headers:{"Cache-Control":"no-store"}});
}