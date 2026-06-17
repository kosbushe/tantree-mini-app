import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CardPreview } from "@/components/CardPreview";
import { getCardArtPath, getCardById } from "@/lib/cards";

interface CardPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CardPageProps): Promise<Metadata> {
  const { id } = await params;
  const card = getCardById(Number(id));

  if (!card) {
    return { title: "Карта не найдена · TANTREE" };
  }

  const artPath = getCardArtPath(card.id);

  return {
    title: `${card.title} · TANTREE`,
    description: card.quote,
    openGraph: {
      title: `TANTREE · ${card.title}`,
      description: card.quote,
      images: [{ url: artPath, width: 1696, height: 2528 }],
    },
  };
}

export default async function CardPage({ params }: CardPageProps) {
  const { id } = await params;
  const card = getCardById(Number(id));

  if (!card) {
    notFound();
  }

  return <CardPreview card={card} />;
}
