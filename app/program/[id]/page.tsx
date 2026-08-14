import Link from "next/link";
import { notFound } from "next/navigation";
import { PROGRAMS, findProgram } from "../../lib/programs";
import ProgramDetail from "./ProgramDetail";

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ id: p.id }));
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = findProgram(id);

  if (!program) notFound();

  return (
    <main className="page">
      <div className="stack" style={{ gap: 20 }}>
        <Link href="/result" className="link-back">
          ← 제도 목록으로
        </Link>
        <ProgramDetail program={program} />
      </div>
    </main>
  );
}
