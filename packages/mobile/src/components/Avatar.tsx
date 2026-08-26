import { View } from "react-native";
import Avatar1 from "~/assets/icons/avatar1.svg";
import Avatar2 from "~/assets/icons/avatar2.svg";
import Avatar3 from "~/assets/icons/avatar3.svg";
import Avatar4 from "~/assets/icons/avatar4.svg";

export const AVATAR_URLS = [
  "internal://1",
  "internal://2",
  "internal://3",
  "internal://4",
] as const;

export type AvatarUrl = (typeof AVATAR_URLS)[number];

export function resolveAvatarUrl(url: string | null | undefined): AvatarUrl {
  if (url && AVATAR_URLS.includes(url as AvatarUrl)) {
    return url as AvatarUrl;
  }
  return "internal://1";
}

// // Avatar 1: Deep blue — two offset overlapping circles
// const Design1 = ({ size }: { size: number }) => (
//   <View
//     style={{
//       width: size,
//       height: size,
//       borderRadius: size / 2,
//       backgroundColor: "#1c4e80",
//       overflow: "hidden",
//     }}
//   >
//     <View
//       style={{
//         position: "absolute",
//         width: size * 0.65,
//         height: size * 0.65,
//         borderRadius: (size * 0.65) / 2,
//         backgroundColor: "#2d6fa8",
//         top: size * 0.08,
//         left: size * 0.04,
//       }}
//     />
//     <View
//       style={{
//         position: "absolute",
//         width: size * 0.55,
//         height: size * 0.55,
//         borderRadius: (size * 0.55) / 2,
//         backgroundColor: "#4a8fc4",
//         bottom: size * 0.06,
//         right: size * 0.04,
//       }}
//     />
//   </View>
// );

// // Avatar 2: Amber/orange — rotated square (diamond) with inner square
// const Design2 = ({ size }: { size: number }) => (
//   <View
//     style={{
//       width: size,
//       height: size,
//       borderRadius: size / 2,
//       backgroundColor: "#c4580a",
//       overflow: "hidden",
//       justifyContent: "center",
//       alignItems: "center",
//     }}
//   >
//     <View
//       style={{
//         width: size * 0.52,
//         height: size * 0.52,
//         backgroundColor: "#e57a30",
//         transform: [{ rotate: "45deg" }],
//       }}
//     />
//     <View
//       style={{
//         position: "absolute",
//         width: size * 0.28,
//         height: size * 0.28,
//         backgroundColor: "#f7a96a",
//         transform: [{ rotate: "45deg" }],
//       }}
//     />
//   </View>
// );

// // Avatar 3: Teal/green — bold ring with a solid inner dot
// const Design3 = ({ size }: { size: number }) => (
//   <View
//     style={{
//       width: size,
//       height: size,
//       borderRadius: size / 2,
//       backgroundColor: "#0d6b56",
//       overflow: "hidden",
//       justifyContent: "center",
//       alignItems: "center",
//     }}
//   >
//     <View
//       style={{
//         width: size * 0.7,
//         height: size * 0.7,
//         borderRadius: (size * 0.7) / 2,
//         borderWidth: size * 0.1,
//         borderColor: "#1fa882",
//       }}
//     />
//     <View
//       style={{
//         position: "absolute",
//         width: size * 0.28,
//         height: size * 0.28,
//         borderRadius: (size * 0.28) / 2,
//         backgroundColor: "#3ecfaa",
//       }}
//     />
//   </View>
// );

// // Avatar 4: Dark purple — three horizontal bars (staggered lengths)
// const Design4 = ({ size }: { size: number }) => (
//   <View
//     style={{
//       width: size,
//       height: size,
//       borderRadius: size / 2,
//       backgroundColor: "#3b1a6b",
//       overflow: "hidden",
//       justifyContent: "center",
//       alignItems: "center",
//       gap: size * 0.1,
//     }}
//   >
//     <View
//       style={{
//         width: size * 0.6,
//         height: size * 0.13,
//         borderRadius: size * 0.06,
//         backgroundColor: "#8a4fcf",
//       }}
//     />
//     <View
//       style={{
//         width: size * 0.45,
//         height: size * 0.13,
//         borderRadius: size * 0.06,
//         backgroundColor: "#a870e8",
//       }}
//     />
//     <View
//       style={{
//         width: size * 0.28,
//         height: size * 0.13,
//         borderRadius: size * 0.06,
//         backgroundColor: "#c498f8",
//       }}
//     />
//   </View>
// );

const Design1 = ({ size }: { size: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
    <Avatar1 width={size} height={size} />
  </View>
);
const Design2 = ({ size }: { size: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
    <Avatar2 width={size} height={size} />
  </View>
);
const Design3 = ({ size }: { size: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
    <Avatar3 width={size} height={size} />
  </View>
);
const Design4 = ({ size }: { size: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
    <Avatar4 width={size} height={size} />
  </View>
);

const DESIGNS: Record<AvatarUrl, React.ComponentType<{ size: number }>> = {
  "internal://1": Design1,
  "internal://2": Design2,
  "internal://3": Design3,
  "internal://4": Design4,
};

interface AvatarProps {
  url: string | null | undefined;
  size?: number;
}

export function Avatar({ url, size = 40 }: AvatarProps) {
  const resolvedUrl = resolveAvatarUrl(url);
  const Design = DESIGNS[resolvedUrl];
  return <Design size={size} />;
}
