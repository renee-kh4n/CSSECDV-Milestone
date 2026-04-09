const faqModel = require('../models/faqModel');
const logger = require('../logger');

exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await faqModel.getAllFAQs();
        const isAdmin = req.session.user && req.session.user.role === 'admin';
        logger.info(
            `FAQ_FETCH | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('faq', { title: 'FAQs', faqs, isAdmin });
    } catch (err) {
        logger.info(
            `FAQ_FETCH_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.showCreateFAQForm = async (req, res) => {
    try {
        logger.info(
            `FAQ_CREATE | admin=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('editFaq', { title: 'Create FAQ'});
    } catch (err) {

        logger.info(
            `FAQ_CREATE_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.showEditFAQForm = async (req, res) => {
    const faqId = req.params.id;

    try {
        const faq = await faqModel.getFAQByID(faqId);

        if (!faq) {
            return res.render('error', {
                title: 'FAQ not found', message: 'FAQ not found.'
            });
        }
        logger.info(
            `FAQ_UPDATE | admin=${req.session.user?.id} | ip=${req.ip}| faqId=${faqId}`,
        );
        return res.render('editFaq', { title: 'Edit FAQ', faq });
    } catch (err) {
        logger.info(
            `FAQ_UPDATE_ERROR | admin=${req.session.user?.id} | ip=${req.ip}| faqId=${faqId} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.createFAQ = async (req, res) => {
    const { question, answer } = req.body;

    try {

        await faqModel.createFAQ(question, answer);
        logger.info(
            `FAQ_CREATE | admin=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.redirect('/faq');
    } catch (err) {

        logger.info(
            `FAQ_CREATE_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.updateFAQ = async (req, res) => {
    const { question, answer } = req.body;
    const faqId = req.params.id;

    try {
        await faqModel.updateFAQ(faqId, question, answer);

        logger.info(
            `FAQ_UPDATE | admin=${req.session.user?.id} | ip=${req.ip} faqId=${faqId}`,
        );
        return res.redirect('/faq');
    } catch (err) {

        logger.info(
            `FAQ_UPDATE_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | faqId=${faqId} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};

exports.deleteFAQ = async (req, res) => {
    const faqId = req.params.id;

    try {
        await faqModel.deleteFAQ(faqId);
        logger.info(
            `FAQ_DELETE | admin=${req.session.user?.id} | ip=${req.ip} | faqId=${faqId}`,
        );
        return res.redirect('/faq');
    } catch (err) {

        logger.info(
            `FAQ_DELETE_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | faqId=${faqId} | error=${err.stack || err}`,
        );
        console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
        return res.render('error', {
            title: 'Server Error', message: 'Server error.',
            noNavbar: true
        });
    }
};