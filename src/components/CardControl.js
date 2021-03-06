import React from "react";
import NewCardForm from "./NewCardForm";
import CardList from "./CardList";
import CardDetail from "./CardDetail";
import EditCardForm from "./EditCardForm";
import Header from "./Header";
import { connect } from "react-redux";
import * as a from "../actions";
import { withFirestore, isLoaded } from "react-redux-firebase";
import * as firebaseui from "firebaseui";
import firebase from "firebase/app";
// import SignOut from "./SignOut";

class CardControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCard: null,
      editing: false,
    };
  }

  handleClick = () => {
    if (this.state.selectedCard != null) {
      this.setState({
        selectedCard: null,
        editing: false,
      });
    } else {
      const { dispatch } = this.props;
      const action = a.toggleForm();
      dispatch(action);
    }
  };

  handleAddingNewCardToList = () => {
    const { dispatch } = this.props;
    const action2 = a.toggleForm();
    dispatch(action2);
  };

  handleChangingSelectedCard = (id) => {
    this.props.firestore.get({ collection: "cards", doc: id }).then((card) => {
      const firestoreCard = {
        term: card.get("term"),
        definition: card.get("definition"),
        id: card.id,
      };
      this.setState({ selectedCard: firestoreCard });
    });
  };

  handleEditClick = () => {
    this.setState({ editing: true });
  };

  handleEditingCardInList = () => {
    this.setState({
      editing: false,
      selectedCard: null,
    });
  };

  handleDeletingCard = (id) => {
    this.props.firestore.delete({ collection: "cards", doc: id });
    this.setState({ selectedCard: null });
  };

  handleUserLogin = () => {
    const { dispatch } = this.props;
    const action = a.toggleLogin();
    dispatch(action);
  };

  render() {
    // const auth = firebaseui.auth.AuthUI.getInstance(this.props.firebase.auth());
    const auth = firebase.auth.EmailAuthProvider.PROVIDER_ID;
    console.log(auth);
    console.log(firebase.auth.EmailAuthProvider.PROVIDER_ID);
    if (!isLoaded(auth)) {
      return (
        <>
          <h1>Loading...</h1>
        </>
      );
    }
    if (isLoaded(auth) && auth == null) {
      return (
        <>
          {/* //how signup and sign in */}
          <h1>You must be signed in to access the flash cards</h1>
        </>
      );
    }
    if (isLoaded(auth) && auth != null) {
      // const uid = auth.currentUser.uid;
      let currentlyVisibleState = null;
      let buttonText = null;
      if (this.state.editing) {
        currentlyVisibleState = (
          <EditCardForm
            card={this.state.selectedCard}
            onEditCard={this.handleEditingCardInList}
          />
        );
        buttonText = "Return to Card List";
      } else if (this.state.selectedCard != null) {
        currentlyVisibleState = (
          <CardDetail
            card={this.state.selectedCard}
            onClickingDelete={this.handleDeletingCard}
            onClickingEdit={this.handleEditClick}
          />
        );
        buttonText = "Return to Card List";
      } else if (this.props.formVisibleOnPage) {
        currentlyVisibleState = (
          <NewCardForm onNewCardCreation={this.handleAddingNewCardToList} />
        );
        buttonText = "Return to Card List";
      } else {
        currentlyVisibleState = (
          <CardList
            cardList={this.props.masterCardList}
            onCardSelection={this.handleChangingSelectedCard}
          />
        );

        buttonText = "Add Card";
      }
      return (
        <React.Fragment>
          <Header onUserLogin={this.handleUserLogin} />
          {currentlyVisibleState}
          <button onClick={this.handleClick}>{buttonText}</button>
        </React.Fragment>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    formVisibleOnPage: state.formVisibleOnPage,
    login: state.login,
  };
};

CardControl = connect(mapStateToProps)(CardControl);

export default withFirestore(CardControl);
