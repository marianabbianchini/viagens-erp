import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { trips } from "../../../db/schema";

const message = (error: unknown) => error instanceof Error ? error.message : "Erro inesperado";
const authorized = (request: Request) => Boolean(request.headers.get("oai-authenticated-user-email"));

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const db = await getDb();
    const rows = await db.select().from(trips).orderBy(asc(trips.departureDate), asc(trips.departureTime));
    return Response.json({ trips: rows });
  } catch (error) { return Response.json({ error: message(error) }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const body = (await request.json()) as Partial<typeof trips.$inferInsert>;
    for (const field of ["passenger", "origin", "destination", "departureDate", "airline", "locator"] as const) {
      if (!String(body[field] ?? "").trim()) return Response.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }
    const db = await getDb();
    const [trip] = await db.insert(trips).values({
      passenger: String(body.passenger).trim(), surname: String(body.surname ?? "").trim(),
      origin: String(body.origin).trim().toUpperCase(), destination: String(body.destination).trim().toUpperCase(),
      departureDate: String(body.departureDate), departureTime: String(body.departureTime ?? ""),
      airline: String(body.airline), locator: String(body.locator).trim().toUpperCase(), status: String(body.status ?? "Confirmada"),
    }).returning();
    return Response.json({ trip }, { status: 201 });
  } catch (error) { return Response.json({ error: message(error) }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "ID inválido." }, { status: 400 });
    const db = await getDb();
    await db.delete(trips).where(eq(trips.id, id));
    return Response.json({ ok: true });
  } catch (error) { return Response.json({ error: message(error) }, { status: 500 }); }
}
