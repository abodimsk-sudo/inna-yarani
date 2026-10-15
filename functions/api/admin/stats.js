const enc=new TextEncoder();
function b64url(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
async function sign(secret,data){const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64url(new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(data))))}
export async function onRequestGet({request,env}) {
 if(!env.DB||!env.SESSION_SECRET)return Response.json({error:"Service not configured"},{status:503});
 const cookie=request.headers.get("Cookie")||"";const value=cookie.split(";").map(x=>x.trim()).find(x=>x.startsWith("admin_session="))?.slice(14)||"";
 const parts=value.split(".");if(parts.length!==2||!/^\d{13}$/.test(parts[0])||Number(parts[0])<Date.now()||parts[1]!==await sign(env.SESSION_SECRET,parts[0]))return Response.json({error:"Unauthorized"},{status:401,headers:{"Cache-Control":"no-store"}});
 const summary=await env.DB.prepare("SELECT COUNT(*) AS started,COUNT(completed_at) AS completed,COUNT(pledged_at) AS pledged FROM visits").first();
 const days=await env.DB.prepare("SELECT substr(started_at,1,10) AS day, COUNT(*) AS started,COUNT(completed_at) AS completed,COUNT(pledged_at) AS pledged FROM visits WHERE started_at >= datetime('now','-29 days') GROUP BY substr(started_at,1,10) ORDER BY day").all();
 return Response.json({summary,days:days.results},{headers:{"Cache-Control":"no-store"}});
}