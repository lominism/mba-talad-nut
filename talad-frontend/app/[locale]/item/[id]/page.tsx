import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { ItemClient } from './ItemClient';
import { API_URL } from '@/lib/api-config';

interface Props {
  params: Promise<{ id: string }>;
}

async function getItem(id: string) {
  try {
    const res = await fetch(`${API_URL}/items/${id}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching item for metadata:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);

  if (!item) {
    return {
      title: 'Item Not Found | MBS Talad Nut',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const itemImage = item.photoUrls?.[0];
  const priceDisplay = item.price === 0 ? 'FREE' : `฿${item.price.toLocaleString()}`;

  return {
    title: `${item.name} | ${priceDisplay}`,
    description: item.description || `Check out this ${item.name} on MBS Talad Nut.`,
    openGraph: {
      title: `${item.name} | ${priceDisplay}`,
      description: item.description,
      images: itemImage ? [itemImage, ...previousImages] : previousImages,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${item.name} | ${priceDisplay}`,
      description: item.description,
      images: itemImage ? [itemImage] : [],
    },
  };
}

export default async function ItemPage({ params }: Props) {
  const { id } = await params;
  const item = await getItem(id);

  return <ItemClient id={id} initialData={item} />;
}
