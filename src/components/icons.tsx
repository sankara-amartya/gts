import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function NexusLogo() {
  const logoData = PlaceHolderImages.find(img => img.id === 'nexus-logo');

  if (!logoData) return null;

  return (
    <Image
      src={logoData.imageUrl}
      alt={logoData.description}
      width={120}
      height={32}
      data-ai-hint={logoData.imageHint}
      className="dark:invert"
    />
  );
}
