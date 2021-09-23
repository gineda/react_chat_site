import React, { useRef } from 'react'
import { IoIosChatboxes } from 'react-icons/io';
import Dropdown from 'react-bootstrap/Dropdown';
import Image from 'react-bootstrap/Image';
import { useDispatch, useSelector } from 'react-redux';
import firebase from '../../../firebase';
import mime from 'mime-types';
import { setPhotoURL } from '../../../redux/actions/user_action';

function UserPanel() {
    const user = useSelector(state => state.user.currentUser)
    const dispatch = useDispatch();
    const inputOpenImangeRef = useRef();

    const handleLogout = () => {
        firebase.auth().signOut();
    }

    const handleOpenImangeRef = () => {
        inputOpenImangeRef.current.click();
    }

    const handleUploadImage = async (event) => {
        const file = event.target.files[0];

        const metadata = { contentType: mime.lookup(file.name) }

        try {
            //스토리지에 파일 저장하기
            let uploadTaskSnapshot = await firebase.storage().ref()
                .child(`user_image/${user.uid}`)
                .put(file, metadata)

            let downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();

            //프로필 이미지 수정
            await firebase.auth().currentUser.updateProfile({
                photoURL: downloadURL
            })

            dispatch(setPhotoURL(downloadURL))

            //데이터베이스 유저 이미지 수정
            await firebase.database().ref("users")
                .child(user.uid)
                .update({ image: downloadURL })
            
        } catch (error) {
            alert(error)
        }

    }

    return (
        <div>
            {/* Logo */}
            <h3 style={{ color: 'white' }}>
            <IoIosChatboxes />{" "} Chat App
            </h3>

            <div style={{ display: 'flex', marginBottom: '1rem' }}>
                <Image src={ user && user.photoURL }
                    style={{ width: '30p', height: '30px', marginTop: '3px' }}
                    roundedCircle />

                <Dropdown>
                    <Dropdown.Toggle 
                        style={{ background: 'transparent', border: '0px' }}
                        id="dropdown-basic">
                        { user && user.displayName }
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleOpenImangeRef}>
                            프로필 사진 변경
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>
                            로그아웃
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            <input
                onChange={handleUploadImage}
                accept="image/jpeg, image/png"
                style={{ display: 'none' }}
                ref={inputOpenImangeRef}
                type="file"
            />
        </div>
    )
}

export default UserPanel
