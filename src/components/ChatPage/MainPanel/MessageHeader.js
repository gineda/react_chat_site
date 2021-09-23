import React, { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import { FaLock } from 'react-icons/fa';
import { FaLockOpen } from 'react-icons/fa';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { AiOutlineSearch } from 'react-icons/ai';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import { useSelector } from 'react-redux';
import firebase from '../../../firebase';
import { Media } from 'react-bootstrap';

function MessageHeader({handleSearchChange}) {
    const chatRoom = useSelector(state => state.chatRoom.currentChatRoom)
    const isPrivateChatRoom = useSelector(state => state.chatRoom.isPrivateChatRoom)
    const [isFavorited, setIsFavorited] = useState(false);
    const usersRef = firebase.database().ref("users");
    const user = useSelector(state => state.user.currentUser);
    const userPosts = useSelector(state => state.chatRoom.userPosts)

    useEffect(() => {
        if(chatRoom && user) {
        addFavoriteListener(chatRoom.id, user.uid)
        }
    }, [])
    
    const addFavoriteListener = (chatRoomId, userId) => {
        usersRef
            .child(userId)
            .child("favorited")
            .once("value")
            .then(data => {
                if (data.val() !== null){

                    const chatRoomIds = Object.keys(data.val());

                    console.log('data.val()', data.val())
                    console.log('chatRoomIds', chatRoomIds)
                    const isAlreadyFavorited = chatRoomIds.includes(chatRoomId)
                    setIsFavorited(isAlreadyFavorited)
                }
            })
    }

    const handleFavorite = () => {
        if(isFavorited){
            usersRef
                .child(`${user.uid}/favorited`)
                .child(chatRoom.id)
                .remove(err => {
                    if (err !== null){
                        console.error(err);
                    }
                })
            setIsFavorited(prev => !prev)
        } else {
            usersRef
                .child(`${user.uid}/favorited`).update({
                    [chatRoom.id]:{
                        name: chatRoom.name,
                        description: chatRoom.description,
                        createdBy: {
                            name: chatRoom.createdBy.name,
                            image: chatRoom.createdBy.image
                        }
                    }
                })
            setIsFavorited(prev => !prev)

        }
    }
    const renderUserPosts = (userPosts) => 
        Object.entries(userPosts)
        .sort((a,b)=> b[1].count - a[1].count)
        .map(([key, val], i) => (
            <Media key={i}>
                <img
                    style={{ borderRadius: 25 }}
                    width={48}
                    height={48}
                    className="mr-3"
                    src={val.image}
                    alt={val.name}
                />
                <Media.Body>
                    <h6>{key}</h6>
                    <p>
                        {val.count} 개
                    </p>
                </Media.Body>

            </Media>
        ))


    return (
        <div style={{
            width: '100%',
            height: '170px',
            border: '.2rem solid #ececec',
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '1rem'
        }}>
            <Container>
            <Row>
                <Col>
                <h2> 

                    {isPrivateChatRoom ?
                        <FaLock style = {{ marginBottom: '5px' }}/> 
                        :
                        <FaLockOpen style = {{ marginBottom: '5px' }}/>
                    }
                    
                    {chatRoom && chatRoom.name}

                    {!isPrivateChatRoom &&
                    <span style={{ cursor: 'pointer'}} onClick={handleFavorite}>
                        {isFavorited ?
                            <MdFavorite style = {{ marginBottom: '5px' }}/>
                            :
                            <MdFavoriteBorder style = {{ marginBottom: '5px' }}/>
                        
                        }


                    </span> }
                 
                </h2> 
                </Col>


                <Col>
                <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">
                            <AiOutlineSearch />
                        </InputGroup.Text>
                        <FormControl
                            onChange={handleSearchChange}
                            placeholder="Search Messages"
                            aria-label="Search"
                            aria-describedby="basic-addon1"
                        />
                 </InputGroup>
                
                </Col>
            </Row>

            {!isPrivateChatRoom &&
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <p>
                        <Image src = {chatRoom && chatRoom.createdBy.image}
                            roundedCircle style= {{ width: '30px', height: '30px'}}
                        /> {" "} {chatRoom && chatRoom.createdBy.name}
                    </p>

                </div>
            }
            <Row>
                <Col>
                <Accordion >
                            <Card>
                                <Card.Header style={{ padding: '0 1rem' }}>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                        Description
                                    </Accordion.Toggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body> 
                                        {chatRoom && chatRoom.description}
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                </Col>
                <Col>
                <Accordion >
                            <Card>
                                <Card.Header style={{ padding: '0 1rem' }}>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                        Post Count
                                    </Accordion.Toggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>
                                        {userPosts && renderUserPosts(userPosts)}
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                </Col>
            </Row>
            </Container>
        </div>
    )
}

export default MessageHeader
