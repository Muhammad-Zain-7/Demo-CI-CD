import * as React from "react";
import { theme } from "../../config/theme";

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  hover = true,
}) => {
  const baseClasses = `
    bg-[${theme.colors.surface}]
    border border-[${theme.colors.lightAccent}]
    border-opacity-20
    rounded-2xl
    overflow-hidden
    transition-all duration-300
    ${
      hover
        ? `hover:transform hover:-translate-y-2 hover:shadow-2xl hover:border-opacity-40`
        : ""
    }
    ${onClick ? "cursor-pointer" : ""}
  `;

  return (
    <div className={`${baseClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    img: string;
    network: string;
    totalSupply: number;
  };
  nftCount?: number;
  onClick: () => void;
  key?: string;
}

// Utility function to truncate text to specified number of words
const truncateWords = (text: string, wordLimit: number): string => {
  const words = text.split(" ");
  if (words.length <= wordLimit) {
    return text;
  }
  return words.slice(0, wordLimit).join(" ") + "...";
};

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  nftCount = 0,
  onClick,
}) => {
  return (
    <Card onClick={onClick} className="group collection-card">
      <div className="relative overflow-hidden">
        <div className="aspect-square w-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
          {collection.img ? (
            <img
              src={collection.img}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">🎨</div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{collection.name}</h3>
        <p className="text-gray-300 text-sm mb-4">
          {truncateWords(collection.description, 4)}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <span className="text-green-400 font-medium">{nftCount}</span>{" "}
            available NFTs
          </div>
          <div className="text-sm text-gray-400">
            Network:{" "}
            <span className="text-blue-400 font-medium capitalize">
              {collection.network}
            </span>
          </div>
        </div>

        <button
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg mt-4"
          onClick={onClick}
        >
          Browse Collection
        </button>
      </div>
    </Card>
  );
};
