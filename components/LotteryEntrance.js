import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import { contractAddresses, abi } from "../constants";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
  const { isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("");

  const dispatch = useNotification();

  const chainId = parseInt(chainIdHex);
  const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const {
    runContractFunction: enterLottery,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "enterLottery",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getNumberOfPlayers",
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getRecentWinner",
  });

  async function updateUI() {
    const entranceFee = (await getEntranceFee()).toString();
    const numberOfPlayers = (await getNumberOfPlayers()).toString();
    const recentWinner = await getRecentWinner();
    setEntranceFee(entranceFee);
    setNumberOfPlayers(numberOfPlayers);
    setRecentWinner(recentWinner);
  }

  useEffect(() => {
    if (isWeb3Enabled && lotteryAddress) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  };

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      handleNewNotification();
      updateUI();
    } catch (e) {
      console.log(e);
    }
  };

  // note: once a winner is selected => UI can auto pick up that winner (future task)
  // somthing can acchive with winner event emit

  return (
    <div className="p-5">
      <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
      {lotteryAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async () =>
              await enterLottery({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Lottery</div>
            )}
          </button>
          <p>Lottery Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</p>
          <p>number of player: {numberOfPlayers}</p>
          <p>recentWinner: {recentWinner}</p>
        </div>
      ) : (
        <p>Please connect to a supported chain</p>
      )}
    </div>
  );
}
