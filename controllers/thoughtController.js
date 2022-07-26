const { Thought, User } = require("../models");
// const { populate } = require("../models/User");

const thoughtController = {
getAllThoughts: function(req, res) {
    Thought.find().then((thought) => res.json(thought)).catch((err) => res.status(500).json(err));

},

addThought: function(req, res) {
   Thought.create(req.body)
   .then((dbThoughtData) => {
       return User.findOneAndUpdate(
           {username:req.body.username},
           {$push:{ thoughts:dbThoughtData._id}},
           {new:true}
       )
   })
   .then(userData => res.json(userData))
   .catch((err) => res.status(500).json(err));
},

updateThought: function(req, res) {
    Thought.findOneAndUpdate({
        _id: req.params.thoughtId
    }, {
        $set: req.body
    }, {
        runValidators: true,
        new: true
    }).then((thought) => {
        !thought ? res.status(404).json({message: 'No thought by ID'}) : res.json(thought);

    }).catch((err) => res.status(500).json(err));


},

getThoughtById: function ({ params }, res) {
    Thought.findOne({ _id: params.thoughtId })
      .then((dbThoughtData) => {
        if (!dbThoughtData) {
          res.status(404).json({ message: "No thought with this ID" });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

deleteThought: function(req, res) {
    Thought.findOneAndDelete({_id: req.params.thoughtId})
    .then((thought) => {
        if(!thought){
            res.status(404).json({message: 'No thought with that ID'}) 
        }     
        
        return User.findOneAndUpdate(
            {_id:req.body.userID},
            {$pull:{thoughts:thought._id}},
            {new:true}
 
        )
   }).then(() => res.json({message: 'User and associated apps deleted!'})).catch((err) => res.status(500).json(err));
},

addReaction: function(req, res) {
    console.log('You are adding a reaction');
    console.log(req.params.thoughtId);
    console.log(req.body);
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reactions: req.body} },
      { runValidators: true, new: true }
    )
      .then((thought) =>
      { 
        console.log(thought)
        !thought
          ? res
              .status(404)
              .json({ message: 'No friend found with that ID :(' })
          : res.json(thought)
      })
      .catch((err) => res.status(500).json(err));
  },

deleteReaction: function(req, res) {
  console.log(req.params)

    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: { reactionId: req.params.reactionId} } },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res
              .status(404)
              .json({ message: 'No thought found with that ID :(' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
}

module.exports = thoughtController;