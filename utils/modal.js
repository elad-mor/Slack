function getModalDefinition(email, originalText) {
  return {
    type: "modal",
    title: { type: "plain_text", text: "Create A Ticket", emoji: true },
    submit: { type: "plain_text", text: "Send", emoji: true },
    close: { type: "plain_text", text: "Cancel", emoji: true },
    blocks: [
      {
        type: "input",
        block_id: "emailarea",
        element: {
          type: "plain_text_input",
          action_id: "plain_text_input-action",
          initial_value: email || ""
        },
        label: { type: "plain_text", text: "Requester Email:", emoji: true }
      },
      {
        type: "input",
        block_id: "descarea",
        element: {
          type: "plain_text_input",
          multiline: true,
          action_id: "plain_text_input-action",
          initial_value: originalText || ""
        },
        label: { type: "plain_text", text: "Request Description:", emoji: true }
      }
      // Add other blocks as needed
    ]
  };
}

module.exports = { getModalDefinition };
