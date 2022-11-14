var express = require('express');
var router = express.Router();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const getGPTResponse = async () => {
  const response = await openai.createCompletionFromModel({
    model: "text-davinci-002",
    prompt: "Get context from the Constitution of India and understand the below scenario and provide a detailed advice like a lawyer.  Don't ever suggest to go to another lawyer. If you don't know the answer say \"I am not sure maybe you need to ask this to a lawyer\".\n\n\nQ: What can I do if someone's pet bite me? I live in a neighbourhood where almost every household has a dog or two and not the ones that play but guard dogs so if I was wondering if I m just minding my own business and someone's dog comes and bite me what are the charges I can put the owner in?",
    temperature: 0.14,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response.data;
}

/* GET gpt3 response. */
router.get('/response', async (req, res, next) => {
  const gptResponse = await getGPTResponse();
  res.status(200).append('Content-Type', 'application/json; charset=UTF-8').send({ answer: gptResponse.choices?.[0]?.text });
});


module.exports = router;
