const enc=new TextEncoder();
function b64url(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
async function sign(secret,data){const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64url(new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(data))))}
async function equal(a,b){const aa=enc.encode(a),bb=enc.encode(b);if(aa.length!==bb.length)return false;let n=0;for(let i=0;i<aa.length;i++)n|=aa[i]^bb[i];return n===0}
export async function onRequestPost({request,env}) {
 if(!env.ADMIN_PIN||!env.SESSION_SECRET)return Response.json({error:"Admin access not configured"},{status:503});
 let body;try{body=await request.json()}catch{return Response.json({error:"Invalid request"},{status:400})}
 if(typeof body.pin!=="string"||!(await equal(body.pin,env.ADMIN_PIN)))return Response.json({error:"رمز الدخول غير صحيح"},{status:401,headers:{"Cache-Control":"no-store"}});
 const expiry=Date.now()+8*60*60*1000;const payload=String(expiry);const sig=await sign(env.SESSION_SECRET,payload);
 return Response.json({ok:true},{headers:{"Set-Cookie":"admin_session="+payload+"."+sig+"; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=28800","Cache-Control":"no-store"}});
}