// --------slider---------
import Mayabilake from '@/assets/images/android-icon-monochrome.png';
import Modutila from '@/assets/images/android-icon-monochrome.png';
import Gojniobokas from '@/assets/images/android-icon-monochrome.png';

// -----------logo-------

import applogo from '@/assets/images/android-icon-monochrome.png';
type ImageSource = string;

interface OnboardingItem {
  id: number;
  title: string;
  description: string;
  image: ImageSource;
}

export const images = {
  Mayabilake,
  Modutila,
  Gojniobokas,
};

export const icons = {
  applogo,
};

export const onboarding: OnboardingItem[] = [
  {
    id: 1,
    title: 'Discover Your Unique Style',
    description:
      'Explore fashion that reflects your personality. Stand out with our exclusive collections.',
    image: images.Mayabilake,
  },
  {
    id: 2,
    title: 'Designs That Inspire',
    description:
      'From streetwear to haute couture — find the inspiration to redefine your wardrobe.',
    image: images.Gojniobokas,
  },
  {
    id: 3,
    title: 'Fashion Meets Comfort',
    description:
      'Experience the perfect blend of elegance and ease in every outfit.',
    image: images.Modutila,
  },
];

export const data = {
  onboarding,
};