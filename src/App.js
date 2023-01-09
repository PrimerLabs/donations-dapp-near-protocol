import React, { useEffect, useState } from "react";
import * as nearAPI from "near-api-js";

import "./styles.css";

const donation_account_details = [
  {
    org_name: "who",
    account: "who.donations.primerlabs.testnet",
    balance: null,
    title: "World Health Organisation"
  },
  {
    org_name: "dwb",
    account: "dwb.donations.primerlabs.testnet",
    balance: null,
    title: "Doctors without Borders"
  },
  {
    org_name: "unicef",
    account: "unicef.donations.primerlabs.testnet",
    balance: null,
    title: "UNICEF"
  }
];

export default function DonationsDApp({
  wallet,
  isSignedIn,
  contractId,
  nearConnection
}) {
  const [selected, setSelected] = React.useState(null);
  const [donations, setDonations] = React.useState([]);
  // const [loading, setLoading] = React.useState(false);
  // const [response, setResponse] = useState(null);

  const donate = async (amount, org_name) => {
    // console.log(org_name, amount);
    const res = await wallet.callMethod({
      method: "donate",
      args: { org: org_name },
      contractId,
      deposit: nearAPI.utils.format.parseNearAmount(amount)
    });
    return res;
  };

  const view_donations = () => {
    wallet
      .viewMethod({ method: "view_donations", contractId })
      .then(setDonations);
  };

  useEffect(() => {
    view_donations();
  }, []);

  const get_account_balance = async (donation_account) => {
    const account = await nearConnection.account(donation_account.account);

    const accountBalance = await account.getAccountBalance();
    const accountBalanceInNEAR = nearAPI.utils.format.formatNearAmount(
      accountBalance.available
    );

    return accountBalanceInNEAR;
  };

  const get_title = (org_name) =>
    donation_account_details.find((x) => x.org_name === org_name).title;

  const get_date = (date) => {
    const parseDate = new Date(date);
    return `${parseDate.toLocaleTimeString()} on ${parseDate.toDateString()}`;
  };

  return (
    <div className="Donations-DApp">
      <h1>Donations DApp</h1>
      <br />
      <UserSignIn
        contractId={contractId}
        wallet={wallet}
        isSignedIn={isSignedIn}
      />
      <div className="DonationsAppContainer">
        <div className="CharityItem">
          <h2>Recent Donations</h2>
          <ul style={{ textAlign: "left", fontVariant: "all-small-caps" }}>
            {donations.map(
              ({ accountId, amount, org_name, created_at }, idx) => (
                <li key={idx}>
                  <b>{accountId}</b> donated <b>{amount} Ⓝ</b> to{" "}
                  <b>
                    {get_title(org_name)} at {get_date(created_at)}
                  </b>{" "}
                </li>
              )
            )}
          </ul>
        </div>
        {donation_account_details.map((acc, idx) => (
          <CharityItem
            key={idx}
            details={acc}
            setSelected={setSelected}
            selected={selected}
            getAccountBalance={get_account_balance}
            isSignedIn={isSignedIn}
            donate={donate}
          />
        ))}
      </div>
    </div>
  );
}

const UserSignIn = ({ isSignedIn, wallet, contractId }) => {
  if (isSignedIn) {
    return (
      <div>
        Signed In as <b>{wallet.accountId}</b>
        <br />
        <button onClick={() => wallet.signOut()} className="donations-button">
          Sign Out
        </button>
      </div>
    );
  } else {
    return (
      <button onClick={() => wallet.signIn()} className="donations-button">
        Sign In
      </button>
    );
  }
};

const CharityItem = ({
  details,
  setSelected,
  selected,
  getAccountBalance,
  isSignedIn,
  donate
}) => {
  const [account_details, setAccountDetails] = useState(details);

  useEffect(() => {
    getAccountBalance(account_details).then((balance) =>
      setAccountDetails({ ...account_details, balance: balance })
    );
  }, []);

  const { org_name, balance, title, account } = account_details;

  return (
    <div
      className="CharityItem"
      data-selected={selected === org_name}
      onClick={() => setSelected(org_name)}
    >
      <h1>{title}</h1>
      <h2>{balance ? `${balance} Ⓝ` : "Fetching Balance..."}</h2>
      <h4>{account}</h4>
      <DonationBox
        show={selected === org_name}
        title={title}
        isSignedIn={isSignedIn}
        donate={donate}
        org_name={org_name}
      />
    </div>
  );
};

const DonationBox = ({ show, title, isSignedIn, donate, org_name }) => {
  return (
    <div
      style={{
        background: "indigo",
        height: show ? "160px" : "30px",
        transform: show ? "scaleY(1)" : "scaleY(0)",
        opacity: show ? 1 : 0,
        width: "75%",
        margin: "10px auto",
        borderRadius: "10px",
        transition: "0.5s",
        color: "floralwhite",
        padding: "10px"
      }}
    >
      <h3>
        Donate to <span style={{ color: "salmon" }}>{title}</span>
      </h3>
      {!isSignedIn && (
        <p>
          <b>Sign-in</b> to donate to <b>{title}</b>
        </p>
      )}
      <div>
        <button
          id="charity"
          data-issignedin={isSignedIn}
          className="donations-button"
          onClick={() => donate("1", org_name)}
        >
          1 Ⓝ
        </button>
        <button
          data-issignedin={isSignedIn}
          id="charity"
          className="donations-button"
          onClick={() => donate("5", org_name)}
        >
          5 Ⓝ
        </button>
        <button
          data-issignedin={isSignedIn}
          id="charity"
          className="donations-button"
          onClick={() => donate("10", org_name)}
        >
          10 Ⓝ
        </button>
      </div>
    </div>
  );
};
