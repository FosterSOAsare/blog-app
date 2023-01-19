import React, { useEffect, useReducer, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import EditorBalloon from "@ckeditor/ckeditor5-build-balloon";
import { useGlobalContext } from "../../context/AppContext";
import { Navigate, useParams } from "react-router";
import { removeHTML, removeSpaces, removeSpecialChars } from "../../utils/Text";
const CreateBlog = () => {
	const [edit, setEdit] = useReducer(reducerFunc, { data: null });
	function reducerFunc(edit, action) {
		switch (action.type) {
			case "setData":
				return { ...edit, data: action.payload };
			default:
				return edit;
		}
	}
	// Edit page also used the createBlogPage
	let { credentials, firebase } = useGlobalContext();
	const [stored, setStored] = useReducer(storedFunc, { stored: false, published: false });
	let article = useRef(null);
	let leadImage = useRef(null);
	let header = useRef(null);
	// Check params
	let { blogId } = useParams();

	useEffect(() => {
		// Fetch blog data
		blogId &&
			firebase.fetchBlog(blogId, (res) => {
				setEdit({ type: "setData", payload: res });
			});
		// blogId && "";
	}, [blogId, firebase]);

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
	return (
		<>
			<section className="App createBlog">
				<p className="username">{credentials?.user?.username}</p>
				<div className="controls">
					<a href="https://read.cash/@Read.Cash/how-to-use-the-editor-at-readcash-e2df60aa" target="_blank" rel="noreferrer">
						Editor help
					</a>
					<button className="draft">Save as Draft</button>
					<button onClick={publishArticle}>Publish</button>
					<div className="dots"></div>
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
								writer.setStyle("font-size", "42px", editor.editing.view.document.getRoot());
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
		</>
	);
};

export default CreateBlog;
