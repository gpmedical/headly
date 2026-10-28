import { Redirect, type Href } from "expo-router";

// SDK 58's generated types can retain "/index" for grouped index routes.
// At runtime an index route resolves to its group, without an /index segment.
export default function Index() {
  return <Redirect href={"/(tabs)" as Href} />;
}
