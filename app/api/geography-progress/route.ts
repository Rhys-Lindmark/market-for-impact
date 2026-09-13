import progress from '@/docs/geography-progress.json';
export async function GET(){
 const {schemaVersion,updated,currentPhase,targets,editions}=progress;
 return Response.json({schemaVersion,updated,currentPhase,targets,editions});
}
