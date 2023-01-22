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
const CreateBlog = () => {
	const [edit, setEdit] = useReducer(reducerFunc, { data: null });
	const [navigate, setNavigate] = useState(false);
	const { error, errorFunc } = useAuthContext();

	// Clear error on start up
	useEffect(() => {
		errorFunc({ type: "clearError" });
	}, [errorFunc]);
	// Edit page also used the createBlogPage
	let { credentials, firebase, notFound, setNotFound } = useGlobalContext();
	const [stored, setStored] = useReducer(storedFunc, { stored: false, published: false });
	const [confirmDeleteBlog, setConfirmDeleteBlog] = useState(false);
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
	function publishArticle(e) {
		let message = article.current.editor.getData();
		let heading = header.current.editor.getData();
		let image = leadImage.current;

		if (edit?.data) {
			let data = {};
			if (image.files?.length) {
				let ext = image.files[0].name.split(".");
				ext = ext[ext.length - 1];
				data.name = removeSpaces(removeSpecialChars(removeHTML(heading))).toLowerCase() + "-" + new Date().getTime() + "." + ext.toLowerCase();
				data.file = image.files[0];
			}

			firebase.updateBlog({ ...data, heading, message, blog_id: blogId }, (res) => {
				if (res.error) return;
				setStored({ type: "publish" });
			});
			return;
		}
		if (!image.files?.length) {
			errorFunc({ type: "displayError", payload: "Lead Image not set. Please add a lead image " });
			return;
		}
		if (removeHTML(heading).length < 4) {
			errorFunc({ type: "displayError", payload: "Heading must be more than 4 characters long" });
			return;
		}
		if (removeHTML(heading).length < 25) {
			errorFunc({ type: "displayError", payload: "Post must be more than 25 characters long" });
			return;
		}
		let ext = image.files[0].name.split(".");
		ext = ext[ext.length - 1];
		let name = removeSpaces(removeSpecialChars(removeHTML(heading))).toLowerCase() + "-" + new Date().getTime() + "." + ext.toLowerCase();

		firebase.storeBlog({ type: "publish", heading, message, author_id: credentials?.userId, author: credentials?.user?.username, name, file: image.files[0] }, (res) => {
			if (res.error) return;
			setStored({ type: "publish" });
		});
	}
	function deleteArticle(e) {
		firebase.deleteArticle(blogId, (res) => {
			setNavigate(true);
			setNotFound(false);
			if (res.error) return;
		});
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
							<button onClick={publishArticle}>Publish</button>
							{edit?.data && (
								<button className="cancel delete" onClick={() => setConfirmDeleteBlog(true)}>
									Delete
								</button>
							)}
						</div>

						<div className="adds">
							<button>Add Topics</button>
							<button>Submit to community</button>
							<label htmlFor="lead__image">Add lead image</label>
							<input type="file" accept="image/*" name="lead__image" id="lead__image" ref={leadImage} />
						</div>
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
					</section>
					{stored.published && <Navigate to={`/@${credentials?.user?.username}`} />}
					{navigate && <Navigate to={`/@${credentials?.user?.username}`} />}
				</>
			)}
			{!notFound && error.display !== "none" && (
				<div className="error">
					<p>{error.text}</p>
					<button onClick={() => errorFunc({ type: "clearError" })}>Okay</button>
				</div>
			)}
			{notFound && <NotFound />}
		</>
	);
};

export default CreateBlog;
