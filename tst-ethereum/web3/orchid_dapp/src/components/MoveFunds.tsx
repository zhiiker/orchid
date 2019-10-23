import React, {Component} from "react";
import {OrchidAPI} from "../api/orchid-api";
import {orchidMoveFundsToEscrow, oxtToWeiString, weiToOxtString} from "../api/orchid-eth";
import {errorClass, parseFloatSafe} from "../util/util";
import {TransactionResult} from "./TransactionResult";
import {SubmitButton} from "./SubmitButton";

const BigInt = require("big-integer"); // Mobile Safari requires polyfill

export class MoveFunds extends Component {

  state = {
    moveAmount: null as number | null,
    amountError: true,
    potBalance: null as BigInt | null,
    // tx
    running: false,
    text: "",
    txId: "",
  };

  componentDidMount(): void {
    let api = OrchidAPI.shared();
    api.lotteryPot_wait.subscribe(pot => {
      this.setState({potBalance: pot.balance});
    });
  }

  async submitMoveFunds() {
    let api = OrchidAPI.shared();
    let account = api.account.value;
    if (account == null || this.state.moveAmount == null) {
      return;
    }
    this.setState({running: true});

    try {
      const moveEscrowWei = oxtToWeiString(this.state.moveAmount);
      let txId = await orchidMoveFundsToEscrow(moveEscrowWei);
      this.setState({
        text: "Transaction Complete!",
        txId: txId,
        running: false,
      });
      api.updateAccount().then();
    } catch (err) {
      this.setState({
        text: "Transaction Failed.",
        running: false,
      });
    }
  }

  render() {
    let api = OrchidAPI.shared();
    let submitEnabled = api.account.value !== null
        && !this.state.running
        && this.state.moveAmount != null;
    return (
        <div>
          <label className="title">Move Funds</label>
          <p className="instructions">
            Move funds from your Lottery Pot balance to your escrow. Balance funds are used by
            Orchid services and can be withdrawn at any time. Escrow funds are required to participate in
            the Orchid network and can be withdrawn after an unlock notice period.
          </p>
          <label>Available Lottery Pot Balance Amount</label>
          <input type="number" className="pot-balance" placeholder="Amount in OXT"
                 value={this.state.potBalance == null ? "" : weiToOxtString(this.state.potBalance, 4)}
                 readOnly/>
          <label>Move to Escrow Amount<span className={errorClass(this.state.amountError)}> *</span></label>
          <input
              type="number" placeholder="Amount in OXT" className="editable"
              onInput={(e) => {
                let amount = parseFloatSafe(e.currentTarget.value);
                const valid = amount != null && amount > 0
                    && (this.state.potBalance == null || BigInt(amount) <= this.state.potBalance);
                this.setState({
                  moveAmount: amount,
                  amountError: !valid
                });
              }}
          />
          <SubmitButton onClick={() => this.submitMoveFunds().then()} enabled={submitEnabled}/>
          <TransactionResult
              running={this.state.running}
              text={this.state.text}
              txId={this.state.txId}
          />
        </div>
    );
  }
}
