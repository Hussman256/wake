import { MirrorSetupView } from "./MirrorSetupView";

export default async function MirrorSetupPage(props: PageProps<"/mirror/[address]">) {
  const { address } = await props.params;
  return <MirrorSetupView address={address} />;
}
