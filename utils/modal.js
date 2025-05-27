function getModalDefinition(email = '', originalText = '') {
  return {
    type: "modal",
    callback_id: "create_ticket_modal",
    title: {
      type: "plain_text",
      text: "Create Service Request",
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: "Send",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true
    },
    blocks: [
      {
        type: "divider"
      },
      {
        type: "input",
        block_id: "emailarea",
        element: {
          type: "plain_text_input",
          action_id: "plain_text_input-action",
          initial_value: email
        },
        label: {
          type: "plain_text",
          text: "Requester Email:",
          emoji: true
        }
      },
      {
        type: "input",
        block_id: "descarea",
        element: {
          type: "plain_text_input",
          multiline: true,
          action_id: "plain_text_input-action",
          initial_value: originalText
        },
        label: {
          type: "plain_text",
          text: "Request Description:",
          emoji: true
        }
      }
    ]
  };
}

module.exports = { getModalDefinition };
