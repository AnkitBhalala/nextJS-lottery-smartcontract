import { useEffect } from "react";
import { useMoralis } from "react-moralis";

export default function ManualHeader() {
  const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    console.log({ isWeb3Enabled, account });
    if (window.localStorage.getItem("connected")) {
      enableWeb3();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account change to ${account}`);
      if (!account) {
        localStorage.removeItem("connected");
        deactivateWeb3();
        console.log("No account found");
      }
    });
  }, []);

  return (
    <div>
      {account ? (
        <div>connected to {account}</div>
      ) : (
        <button
          onClick={async () => {
            await enableWeb3();
            window.localStorage.setItem("connected", "injected");
          }}
          disabled={isWeb3EnableLoading}
        >
          Connect
        </button>
      )}
    </div>
  );
}
