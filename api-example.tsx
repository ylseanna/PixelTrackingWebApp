import { useRouter } from "next/router";


function MyApp() {
  const router = useRouter();
  useEffect(getData, []);

  async function getData() {
    const response = await fetch(`${router.basePath}api/whatever`);
    setSomething(response.data);
  }

  return <div></div>
}
