import { DossierView } from "./DossierView";

export default async function DossierPage(props: PageProps<"/discover/[address]">) {
  const { address } = await props.params;
  return <DossierView address={address} />;
}
