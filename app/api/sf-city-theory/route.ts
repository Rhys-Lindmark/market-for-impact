import registry from'@/data/san-francisco/city-registry-v1.json';import theory from'@/data/san-francisco/city-theory-v1.json';export function GET(){return Response.json({theory,registry});}
