"use client";

import Image from "next/image";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const Icon = ({
  size = 24,
  color = "currentColor",
  ...props
}: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
};

Icon.displayName = "Icon";

export const AvatarPlaceholderIcon = ({
  className,
  width = 42,
  height = 42,
}: {
  className?: string;
  width?: number;
  height?: number;
}) => {
  return (
    <Image
      className={className}
      src="/user/avatar_placeholder.png"
      alt="Avatar placeholder"
      width={width}
      height={height}
    />
  );
};

AvatarPlaceholderIcon.displayName = "AvatarPlaceholderIcon";

export const SynqIcon = ({
  className,
  width = 42,
  height = 42,
}: {
  className?: string;
  width?: number;
  height?: number;
}) => {
  return (
    <Image
      className={className}
      src="/brand/synq-icon.png"
      alt="Synq logo"
      sizes="(max-width: 768px) 16px, 16px"
      width={width}
      height={height}
    />
  );
};

SynqIcon.displayName = "SynqIcon";

export const TcgplayerIcon = ({
  className,
  width = 24,
  height = 24,
}: {
  className?: string;
  width?: number;
  height?: number;
}) => {
  return (
    <Image
      className={className}
      src="/tcgplayer.svg"
      alt="TCGPlayer"
      width={width}
      height={height}
    />
  );
};

TcgplayerIcon.displayName = "TcgplayerIcon";

export const CardmarketIcon = ({
  className,
  width = 24,
  height = 24,
}: {
  className?: string;
  width?: number;
  height?: number;
}) => {
  return (
    <Image
      className={className}
      src="/cardmarket.svg"
      alt="Cardmarket"
      width={width}
      height={height}
    />
  );
};

CardmarketIcon.displayName = "CardmarketIcon";
