import React, { Component } from 'react'
import { FaCommentsDollar, FaRegSmileWink } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import { connect } from 'react-redux';
import firebase from '../../../firebase';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_action';

export class ChatRooms extends Component {

    state = {
        show: false,
        name: "",
        description: "",
        chatRoomsRef: firebase.database().ref("chatRooms"),
        messagesRef: firebase.database().ref("messages"),
        chatRooms: [],
        firstLoad: true,
        activeChatRoomId: "",
        notifications: []
    }

    componentDidMount(){
        this.AddChatRoomsListeners();
    }
    
    componentWillUnmount(){
        this.state.chatRoomsRef.off();

        this.state.chatRooms.forEach(chatRoom => {
            this.state.messagesRef.child(chatRoom.id).off();
        })
    }

    setFirstChatRoom = () => {
        const firstChatRoom = this.state.chatRooms[0];
        if (this.state.firstLoad && this.state.chatRooms.length > 0) {
            this.props.dispatch(setCurrentChatRoom(firstChatRoom))
            this.setState({ activeChatRoomId: firstChatRoom.id })
        }
        this.setState({ firstLoad: false })
    }

    AddChatRoomsListeners = () => {
        let chatRoomsArray = [];

        this.state.chatRoomsRef.on("child_added", DataSnapshot => {
            chatRoomsArray.push(DataSnapshot.val());
            this.setState({ chatRooms: chatRoomsArray },
                () => this.setFirstChatRoom());

            this.addNotificationListener(DataSnapshot.key);
        })
    }

    addNotificationListener = (chatRoomId) => {
        this.state.messagesRef.child(chatRoomId).on("value", DataSnapshot => {
            if(this.props.chatRoom){
                this.handleNotification(
                    chatRoomId,
                    this.props.chatRoom.id,
                    this.state.notifications,
                    DataSnapshot
                )
            }
        })
    }

    handleNotification = (chatRoomId, currentChatRoomId, notifications, DataSnapshot) => {

        let lastTotal = 0;

        //?????? notifications state?????? ?????? ????????? ???????????? ???????????? ?????? ??? ?????????
        let index = notifications.findIndex(notification =>
            notification.id === chatRoomId) 

            //notifications state ?????? ?????? ???????????? ?????? ????????? ?????? ???
            if(index === -1) {
                notifications.push({
                    id: chatRoomId,
                    total: DataSnapshot.numChildren(),
                    lastKnownTotal: DataSnapshot.numChildren(),
                    count: 0
                })
            }
            //?????? ?????? ???????????? ????????? ?????? ???
            else {
                //???????????? ?????? ????????? ?????? ???????????? ?????? ?????? ???
                if( chatRoomId !== currentChatRoomId){
                    //???????????? ????????? ????????? ??? ????????? ??????
                    lastTotal = notifications[index].lastKnownTotal

                    //count(???????????? ????????? ??????) ?????????
                    //?????? ??? ????????? ?????? - ????????? ????????? ??? ????????? ?????? > 0
                    if (DataSnapshot.numChildren() - lastTotal > 0){
                        notifications[index].count = DataSnapshot.numChildren() - lastTotal;
                    }
                }
                //total property??? ?????? ?????? ????????? ?????? ????????????
                notifications[index].total = DataSnapshot.numChildren();

            }

        //??? ?????? ?????? ?????? ????????? notifications state??? ????????????
        this.setState({ notifications })
    }
    
    handleClose = () => this.setState({ show: false });
    handleShow = () => this.setState({ show: true });

    handleSubmit = (e) => {
        e.preventDefault();
    
        const { name, description } = this.state;

        if (this.isFormVaild(name, description)){
            this.addChatRoom();
        }
    }

    addChatRoom = async () => {

        const key = this.state.chatRoomsRef.push().key;
        const { name, description } = this.state;
        const { user } = this.props;
        const newChatRoom = {
            id: key,
            name: name,
            description: description,
            createdBy: {
                name: user.displayName,
                image: user.photoURL
            }
        };

        try {
            await this.state.chatRoomsRef.child(key).update(newChatRoom);
            this.setState({
                name: "",
                description: "",
                show: false
            })
        } catch (error) {
            alert(error)
        }

    };



    isFormVaild = (name, description) => 
        name && description;

    changeChatRoom = (room) => {
        this.props.dispatch(setCurrentChatRoom(room));
        this.props.dispatch(setPrivateChatRoom(false));
        this.setState({ activeChatRoomId: room.id })
        this.clearNotifications();
    }

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(
            notification => notification.id === this. props.chatRoom.id
        )

        if(index !== -1){
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].lastKnownTotal = this.state.notifications[index].total;
            updatedNotifications[index].count = 0;
            this.setState({ notifications: updatedNotifications });
        }
    }

    getNotificationCount = (room) => {
        //?????? ???????????? count ??? ??????
        let count = 0;
        this.state.notifications.forEach(notification => {
            if(notification.id === room.id) {
                count = notification.count;
            }
        })

        if (count > 0) return count;
    }
    
    renderChatRooms = (chatRooms) =>
    chatRooms.length > 0 &&
    chatRooms.map(room => (
        <li
            key={room.id}
            onClick={() => this.changeChatRoom(room)} 
            style={{
                backgroundColor: room.id === this.state.activeChatRoomId && "#ffffff45"
            }}
            
           >
            # {room.name}
            <Badge style={{ float: 'right' }} variant="danger">
                {this.getNotificationCount(room)}
            </Badge>
        </li>
    ))

    render() {
        const { chatRooms, show, } = this.state;

        return (
            <div>
                <div style={{
                    position: 'relative', width : '100%',
                    display: 'flex', alignItems: 'center'
                }}>
                    <FaRegSmileWink style = {{ marginRight: 3 }} />
                    CHAT ROOMS {" "} ({chatRooms.length})
                    
                    <FaPlus 
                        onClick={this.handleShow}
                        style = {{
                        position: 'absolute',
                        right: 0, cursor: 'pointer'
                    }} />

                </div>

                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {this.renderChatRooms(this.state.chatRooms)}
                </ul>

                {/* {ADD CHAT ROOM MODAL} */}

                <Modal show={show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>Create a chat room</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>??? ?????? </Form.Label>
                                <Form.Control 
                                onChange={(e) => this.setState({ name: e.target.value })}
                                type="text" placeholder="Enter a chat room name" />
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>??? ??????</Form.Label>
                                <Form.Control 
                                onChange={(e) => this.setState({ description: e.target.value })}
                                type="text" placeholder="Enter a chat room description" />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.handleSubmit}>
                        Create
                    </Button>
                    </Modal.Footer>
                </Modal>  
            </div>
        )
    }
}
const mapStateToProps = state => {
    return{
        user: state.user.currentUser,
        chatRoom: state.chatRoom.currentChatRoom
    }
}


export default connect(mapStateToProps)(ChatRooms);
