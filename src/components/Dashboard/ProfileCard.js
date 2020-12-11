import React from 'react'
import {Card} from 'react-bootstrap'

function ProfileCard({profilePicSrc,username}) {
    return (
        <Card className="userInfoCards">
            <Card.Img variant="top" src={profilePicSrc} 
                id="userProfilePic"
            />
            <Card.Body>
                <Card.Text>
                    "{username}"
                </Card.Text>
            </Card.Body>
        </Card>
    )
}

export default ProfileCard
