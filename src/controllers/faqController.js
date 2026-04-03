const faqModel = require('../models/faqModel');

exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await faqModel.getAllFAQs();
        const isAdmin = req.session.user && req.session.user.role === 'admin';
        return res.render('faq', { title: 'FAQs', faqs, isAdmin });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showCreateFAQForm = async (req, res) => {
    try {
        return res.render('editFaq', { title: 'Create FAQ', faq: {} });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showEditFAQForm = async (req, res) => {
    const faqId = req.params.id;

    try {
        const faq = await faqModel.getFAQByID(faqId);
        if (!faq) {
            return res.send('FAQ not found');
        }
        return res.render('editFaq', { title: 'Edit FAQ', faq });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.createFAQ = async (req, res) => {
    const { question, answer } = req.body;

    try {
        await faqModel.createFAQ(question, answer);
        return res.redirect('/faq');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.updateFAQ = async (req, res) => {
    const { question, answer } = req.body;
    const faqId = req.params.id;

    try {
        await faqModel.updateFAQ(faqId, question, answer);
        return res.redirect('/faq');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.deleteFAQ = async (req, res) => {
    const faqId = req.params.id;

    try {
        await faqModel.deleteFAQ(faqId);
        return res.redirect('/faq');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};