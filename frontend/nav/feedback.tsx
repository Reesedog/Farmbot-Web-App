import React, { useState } from "react";
import { FeedbackProps } from "./interfaces";
import { popUp } from "../devices/actions"

export const Feedback = (props: FeedbackProps) => {

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  // "Send" button style
  const buttonStyle = {
    backgroundColor: '#FFA500',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
  };
  // send button change color 
  const hoverStyle = {
    backgroundColor: '#f79205',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
  };
  // clear text box
  const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    // Update the feedbackText state as the user types in the textarea.
    setFeedbackText(event.target.value);
  };
  const handleButtonClick = () => {
    popUp("Feedback received!✨", "We appreciate your valuable feedback.")
    setFeedbackText('');
  };

  const [sendButtonStyle, setSendButtonStyle] = useState(buttonStyle);

  return (
    <div>
      {/* star rate */}
      <div className="star-rating" style={{ fontFamily: 'Arial, sans-serif', fontSize: '24px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Rate our demo</div>
        <style>
          {`
          button {
            background-color: transparent;
            border: none;
            outline: none;
            cursor: pointer;
          }
          .on {
            color: #FFA500;
          }
          .off {
            color: #ccc;
          }
        `}
        </style>
        {[...Array(5)].map((star, index) => {
          index += 1;
          return (
            <button
              type="button"
              key={index}
              className={index <= (hover || rating) ? "on" : "off"}
              onClick={() => setRating(index)}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(rating)}
            >
              <span className="star">&#9733;</span>
            </button>
          );
        })}
      </div>
      {/* feedback */}
      <div style={{ fontWeight: 'bold', fontSize: '15px' }}>How can we improve?</div>
      <textarea
        id="feedback"
        className="p-2 h-24 w-64 border border-gray-400 rounded-md"
        value={feedbackText}
        onChange={handleChange}
      ></textarea>
      {/* send button */}
      <button
        onMouseEnter={() => setSendButtonStyle(hoverStyle)}
        onMouseLeave={() => setSendButtonStyle(buttonStyle)}
        style={sendButtonStyle}
        onClick={handleButtonClick}
      >
        Send
      </button>
    </div>
  )
}










