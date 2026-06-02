import { SocialButton } from './social-button.entity';

export interface ResolvedSocialButton extends SocialButton {
  resolvedLink: string;
}
