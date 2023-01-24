import React, { useEffect, useReducer, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import EditorBalloon from "@ckeditor/ckeditor5-build-balloon";
import { useGlobalContext } from "../../context/AppContext";
import { Navigate, useParams } from "react-router";
import { removeHTML, removeSpaces, removeSpecialChars } from "../../utils/Text";
import NotFound from "../NotFound/NotFound";
import { useState } from "react";
import ConfirmPopup from "../../components/Popups/ConfirmPopup";
import { useAuthContext } from "../../context/AuthContext";
import topics from "../../assets/scss/Topics";
const CreateBlog = () => {
	const [edit, setEdit] = useReducer(reducerFunc, { data: null });
	const [navigate, setNavigate] = useState(false);
	const { error, errorFunc } = useAuthContext();
	let { credentials, firebase, notFound, setNotFound } = useGlobalContext();
	const [stored, setStored] = useReducer(storedFunc, { stored: false, published: false });
	const [confirmDeleteBlog, setConfirmDeleteBlog] = useState(false);
	const [selectedTopics, selectedTopicsDispatchFunc] = useReducer(selectedTopicsFunc, {
		displayForm: false,
		selectedTopics: [],
	});

	// Clear error on start up
	useEffect(() => {
		errorFunc({ type: "clearError" });
	}, [errorFunc]);
	// Edit page also used the createBlogPage

	let article = useRef(null);
	let leadImage = useRef(null);
	let header = useRef(null);
	// Check params
	let { blogId } = useParams();

	function reducerFunc(edit, action) {
		switch (action.type) {
			case "setData":
				return { ...edit, data: action.payload };
			default:
				return edit;
		}
	}

	function selectedTopicsFunc(edit, action) {
		switch (action.type) {
			case "displaySelect":
				return { ...edit, displayForm: action.payload };
			case "setSelectedTopics":
				return { ...edit, selectedTopics: action.payload };
			default:
				return edit;
		}
	}

	useEffect(() => {
		// Fetch blog data
		blogId &&
			firebase.fetchBlog(blogId, (res) => {
				if (res.error) return;
				if (res.empty) {
					setNotFound(true);
					return;
				}
				setEdit({ type: "setData", payload: res });
				if (res.topics) selectedTopicsDispatchFunc({ type: "setSelectedTopics", payload: res.topics });
				setNotFound(false);
			});
		// blogId && "";
	}, [blogId, firebase, setNotFound]);

	function storedFunc(stored, action) {
		switch (action.type) {
			case "saveDraft":
				return { ...stored, stored: true };
			case "publish":
				return { ...stored, published: true };
			default:
				return stored;
		}
	}

	function updateArticle(e) {
		let message = article.current.editor.getData();
		let heading = header.current.editor.getData();
		let image = leadImage.current;

		let data = {};
		if (image.files?.length) {
			let ext = image.files[0].name.split(".");
			ext = ext[ext.length - 1];
			data.name = removeSpaces(removeSpecialChars(removeHTML(heading))).toLowerCase() + "-" + new Date().getTime() + "." + ext.toLowerCase();
			data.file = image.files[0];
		}
		if (selectedTopics.selectedTopics.length > 0) data.topics = selectedTopics.selectedTopics;

		firebase.updateBlog({ ...data, heading, message, blog_id: blogId }, (res) => {
			if (res.error) return;
			setStored({ type: "publish" });
		});
	}
	function publishArticle(e) {
		let message = article.current.editor.getData();
		let heading = header.current.editor.getData();
		let image = leadImage.current;

		if (!image.files?.length) {
			errorFunc({ type: "displayError", payload: "Lead Image not set. Please add a lead image " });
			return;
		}
		if (removeHTML(heading).length < 4) {
			errorFunc({ type: "displayError", payload: "Heading must be more than 4 characters long" });
			return;
		}
		if (removeHTML(message).length < 25) {
			errorFunc({ type: "displayError", payload: "Post must be more than 25 characters long" });
			return;
		}
		let ext = image.files[0].name.split(".");
		ext = ext[ext.length - 1];
		let name = removeSpaces(removeSpecialChars(removeHTML(heading))).toLowerCase() + "-" + new Date().getTime() + "." + ext.toLowerCase();
		firebase.storeBlog(
			{ type: "publish", topics: selectedTopics.selectedTopics, heading, message, author_id: credentials?.userId, author: credentials?.user?.username, name, file: image.files[0] },
			(res) => {
				if (res.error) return;
				setStored({ type: "publish" });
			}
		);
	}
	function deleteArticle(e) {
		firebase.deleteArticle(blogId, (res) => {
			setNavigate(true);
			setNotFound(false);
			if (res.error) return;
		});
	}

	function setTopic(text) {
		if (selectedTopics.selectedTopics.includes(text)) return;
		if (selectedTopics.selectedTopics.length >= 10) {
			errorFunc({ type: "displayError", payload: "Article can have a maximum of 10 topics" });
			return;
		}
		let newData = [...selectedTopics.selectedTopics, text];
		selectedTopicsDispatchFunc({ type: "setSelectedTopics", payload: newData });
	}
	function removeTopic(topic) {
		let newData = selectedTopics.selectedTopics.filter((e) => e !== topic);
		selectedTopicsDispatchFunc({ type: "setSelectedTopics", payload: newData });
	}
	return (
		<>
			{!notFound && (
				<>
					{confirmDeleteBlog && <ConfirmPopup desc={`Are you sure you want to delete the article`} opt1="Delete" opt2="Cancel" setShow={setConfirmDeleteBlog} proceed={deleteArticle} />}
					<section className="App createBlog">
						<div className="controls">
							<a href="https://read.cash/@Read.Cash/how-to-use-the-editor-at-readcash-e2df60aa" target="_blank" rel="noreferrer">
								Editor help
							</a>
							<button className="draft">Save as Draft</button>
							<button onClick={(e) => (blogId ? updateArticle(e) : publishArticle(e))}>{blogId ? "Update" : "Publish"}</button>
							{edit?.data && (
								<button className="cancel delete" onClick={() => setConfirmDeleteBlog(true)}>
									Delete
								</button>
							)}
						</div>

						<div className="adds">
							{selectedTopics.selectedTopics.length === 0 && <button onClick={() => selectedTopicsDispatchFunc({ type: "displaySelect", payload: true })}>Add Topics</button>}
							{selectedTopics.selectedTopics.length > 0 && (
								<p className="blogSelectedTopics">
									Topics :{" "}
									<span>
										{selectedTopics.selectedTopics.join(", ")}
										{!selectedTopics.displayForm && <button onClick={() => selectedTopicsDispatchFunc({ type: "displaySelect", payload: true })}>[click to edit]</button>}
									</span>
								</p>
							)}
							<label htmlFor="lead__image">Add lead image</label>
							<input type="file" accept="image/*" name="lead__image" id="lead__image" ref={leadImage} />
						</div>
						<div className="editors">
							{selectedTopics.displayForm && (
								<section className="selectedTopics">
									<div className="topics">
										<div className="left">
											{selectedTopics.selectedTopics.map((topic, index) => {
												return (
													<span key={index}>
														{topic} <i className="fa-solid fa-x" onClick={() => removeTopic(topic)}></i>
													</span>
												);
											})}
										</div>
										<button onClick={() => selectedTopicsDispatchFunc({ type: "displaySelect", payload: false })}>Done</button>
									</div>
									<aside className="select">
										{topics.map((topic, index) => {
											return (
												<div value={topic} key={index} className="topicItem" onClick={() => setTopic(topic)}>
													{topic}
												</div>
											);
										})}
									</aside>
								</section>
							)}
							<article className="editor header">
								<CKEditor
									editor={EditorBalloon}
									data={edit?.data ? edit?.data?.heading : ""}
									ref={header}
									config={{ placeholder: "Add a title..." }}
									onReady={(editor) => {
										// You can store the "editor" and use when it is needed.
										editor.editing.view.change((writer) => {
											writer.setStyle("min-height", "50px", editor.editing.view.document.getRoot());
											writer.setStyle("font-size", "24px", editor.editing.view.document.getRoot());
										});
									}}
								/>
							</article>
							<article className="editor">
								<CKEditor
									editor={EditorBalloon}
									data={edit?.data ? edit?.data?.message : ""}
									ref={article}
									onReady={(editor) => {
										// You can store the "editor" and use when it is needed.
										editor.editing.view.change((writer) => {
											writer.setStyle("min-height", "300px", editor.editing.view.document.getRoot());
											writer.setStyle("font-size", "17px", editor.editing.view.document.getRoot());
										});
									}}
									config={{ placeholder: "Then start writing..." }}
								/>
							</article>
						</div>
					</section>
					{stored.published && <Navigate to={`/@${credentials?.user?.username}`} />}
					{navigate && <Navigate to={`/@${credentials?.user?.username}`} />}
				</>
			)}
			{!notFound && error.display !== "none" && (
				<div className="blogError">
					<p>{error.text}</p>
					<button onClick={() => errorFunc({ type: "clearError" })}>Okay</button>
				</div>
			)}
			{notFound && <NotFound />}
		</>
	);
};

export default CreateBlog;
