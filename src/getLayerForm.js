module.exports = layer => {
  return {    
    properties: {
      name: 'Properties',
      type: 'form',
      def: {
        name: {
          type: 'text',
          name: 'Name'
        }
      }
    }
  }
}
